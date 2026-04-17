<?php

namespace App\Console\Commands;

use App\Models\Initiative;
use App\Models\TransformationItem;
use App\Models\User;
use App\Models\Workstream;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ImportTransformationExcel extends Command
{
    protected $signature = 'import:transformation-excel
                            {path? : Path to .xlsx (default: database/sources/5FLOW_Excel_Transformation_FINAL.xlsx)}
                            {--append : Keep existing transformation items (otherwise they are replaced)}';

    protected $description = 'Import transformation plan rows from the 5FLOW Excel workbook (sheet 01_Transformation_Plan).';

    private const SHEET = '01_Transformation_Plan';

    private const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

    private const RAGS = ['Green', 'Amber', 'Red'];

    public function handle(): int
    {
        $path = $this->argument('path')
            ?: database_path('sources/5FLOW_Excel_Transformation_FINAL.xlsx');

        if (! is_readable($path)) {
            $this->error("File not readable: {$path}");

            return self::FAILURE;
        }

        $spreadsheet = IOFactory::load($path);
        $sheet = $spreadsheet->getSheetByName(self::SHEET);
        if (! $sheet) {
            $this->error('Sheet "'.self::SHEET.'" not found.');

            return self::FAILURE;
        }

        $rows = $sheet->toArray();
        $admin = User::query()->where('username', 'admin')->first();

        DB::transaction(function () use ($rows, $admin) {
            if (! $this->option('append')) {
                TransformationItem::query()->delete();
                $this->info('Removed existing transformation items (use --append to keep them).');
            }

            $imported = 0;
            foreach (array_slice($rows, 1) as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $workstreamName = isset($row[0]) ? trim((string) $row[0]) : '';
                if ($workstreamName === '') {
                    continue;
                }

                $initiativeName = isset($row[1]) ? trim((string) $row[1]) : '';
                if ($initiativeName === '') {
                    $this->warn("Skipping row with workstream \"{$workstreamName}\" — empty initiative.");

                    continue;
                }

                $workstream = Workstream::query()->firstOrCreate(
                    ['name' => $workstreamName],
                    ['owner_id' => $admin?->id],
                );

                $initiative = Initiative::query()->firstOrCreate(
                    [
                        'workstream_id' => $workstream->id,
                        'name' => $initiativeName,
                    ],
                    ['description' => null],
                );

                $objective = isset($row[2]) ? trim((string) $row[2]) : '';
                $ownerOrg = $this->normalizeOwnerOrg($row[3] ?? null);
                $fiveFlow = $this->nullableString($row[4] ?? null);
                $peer = $this->nullableString($row[5] ?? null);
                $start = $this->parseDate($row[6] ?? null);
                $end = $this->parseDate($row[7] ?? null);
                $status = $this->normalizeStatus($row[8] ?? null);
                $rag = $this->normalizeRag($row[9] ?? null);
                $success = $this->nullableString($row[10] ?? null);
                $deps = $this->nullableString($row[11] ?? null);
                $risks = $this->nullableString($row[12] ?? null);

                if ($deps !== null && $deps !== '') {
                    $success = $success
                        ? $success."\n\nDependencies: ".$deps
                        : 'Dependencies: '.$deps;
                }

                TransformationItem::query()->create([
                    'initiative_id' => $initiative->id,
                    'objective' => $objective !== '' ? $objective : null,
                    'owner_org' => $ownerOrg,
                    'five_flow_contact' => $fiveFlow,
                    'peer_contact' => $peer,
                    'start_date' => $start,
                    'end_date' => $end,
                    'status' => $status,
                    'rag' => $rag,
                    'success_metrics' => $success,
                    'risks' => $risks,
                    'percent_complete' => 0,
                ]);
                $imported++;
            }

            $this->info("Imported {$imported} transformation items.");
        });

        return self::SUCCESS;
    }

    private function normalizeOwnerOrg(mixed $value): string
    {
        $v = strtoupper(trim((string) ($value ?? '')));
        if ($v === '' || $v === 'PEER') {
            return 'Peer';
        }
        if (str_contains($v, '5FLOW') || $v === '5FLOW') {
            return '5Flow';
        }

        return 'Peer';
    }

    private function normalizeStatus(mixed $value): string
    {
        $v = trim((string) ($value ?? ''));
        if ($v === '' || ! in_array($v, self::STATUSES, true)) {
            return 'Not Started';
        }

        return $v;
    }

    private function normalizeRag(mixed $value): ?string
    {
        $v = trim((string) ($value ?? ''));
        if ($v === '') {
            return null;
        }
        foreach (self::RAGS as $allowed) {
            if (strcasecmp($v, $allowed) === 0) {
                return $allowed;
            }
        }

        return null;
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $s = trim((string) $value);

        return $s === '' ? null : $s;
    }

    private function parseDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }
        if (is_numeric($value)) {
            try {
                return Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }
        $t = trim((string) $value);
        if ($t === '') {
            return null;
        }
        $ts = strtotime($t);

        return $ts ? date('Y-m-d', $ts) : null;
    }
}
