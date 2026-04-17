<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::all()->keyBy('slug');

        $users = [
            // ── Program Managers (5) ──
            ['username' => 'yash',       'name' => 'Yash Goyal',             'role' => 'program_manager'],
            ['username' => 'vijai',      'name' => 'Vijai Krishnan',         'role' => 'program_manager'],
            ['username' => 'jagan',      'name' => 'Jagan Mohan',            'role' => 'program_manager'],
            ['username' => 'sriram',     'name' => 'Sriram Venkatesh',       'role' => 'program_manager'],
            ['username' => 'rajesh',     'name' => 'Rajesh Sharma',          'role' => 'program_manager'],

            // ── Workstream Leads (15) ──
            ['username' => 'satish',     'name' => 'Satish Kumar',           'role' => 'workstream_lead'],
            ['username' => 'muthu',      'name' => 'Muthu Selvam',           'role' => 'workstream_lead'],
            ['username' => 'murugesan',  'name' => 'Murugesan Raman',        'role' => 'workstream_lead'],
            ['username' => 'anish',      'name' => 'Anish Nair',             'role' => 'workstream_lead'],
            ['username' => 'kishore',    'name' => 'Kishore Reddy',          'role' => 'workstream_lead'],
            ['username' => 'subbiah',    'name' => 'Subbiah Pillai',         'role' => 'workstream_lead'],
            ['username' => 'mathangi',   'name' => 'Mathangi Subramanian',   'role' => 'workstream_lead'],
            ['username' => 'retheesh',   'name' => 'Retheesh Babu',          'role' => 'workstream_lead'],
            ['username' => 'priya.n',    'name' => 'Priya Natarajan',        'role' => 'workstream_lead'],
            ['username' => 'deepak',     'name' => 'Deepak Menon',           'role' => 'workstream_lead'],
            ['username' => 'arun',       'name' => 'Arun Prasad',            'role' => 'workstream_lead'],
            ['username' => 'kavitha',    'name' => 'Kavitha Sundaram',       'role' => 'workstream_lead'],
            ['username' => 'ramesh',     'name' => 'Ramesh Iyer',            'role' => 'workstream_lead'],
            ['username' => 'nithya',     'name' => 'Nithya Lakshmi',         'role' => 'workstream_lead'],
            ['username' => 'ganesh',     'name' => 'Ganesh Moorthy',         'role' => 'workstream_lead'],

            // ── Team Members (45) ──
            ['username' => 'amit',       'name' => 'Amit Patel',             'role' => 'team_member'],
            ['username' => 'sneha',      'name' => 'Sneha Gupta',            'role' => 'team_member'],
            ['username' => 'rohit',      'name' => 'Rohit Verma',            'role' => 'team_member'],
            ['username' => 'divya',      'name' => 'Divya Raghavan',         'role' => 'team_member'],
            ['username' => 'karthik',    'name' => 'Karthik Sundaresan',     'role' => 'team_member'],
            ['username' => 'meena',      'name' => 'Meena Kumari',           'role' => 'team_member'],
            ['username' => 'vikram',     'name' => 'Vikram Singh',           'role' => 'team_member'],
            ['username' => 'lakshmi',    'name' => 'Lakshmi Narayanan',      'role' => 'team_member'],
            ['username' => 'suresh',     'name' => 'Suresh Babu',            'role' => 'team_member'],
            ['username' => 'anjali',     'name' => 'Anjali Mishra',          'role' => 'team_member'],
            ['username' => 'manoj',      'name' => 'Manoj Tiwari',           'role' => 'team_member'],
            ['username' => 'revathi',    'name' => 'Revathi Krishnamurthy',  'role' => 'team_member'],
            ['username' => 'sanjay',     'name' => 'Sanjay Deshmukh',        'role' => 'team_member'],
            ['username' => 'pooja',      'name' => 'Pooja Hegde',            'role' => 'team_member'],
            ['username' => 'harish',     'name' => 'Harish Chandran',        'role' => 'team_member'],
            ['username' => 'swathi',     'name' => 'Swathi Ravi',            'role' => 'team_member'],
            ['username' => 'prashanth',  'name' => 'Prashanth Rao',          'role' => 'team_member'],
            ['username' => 'geetha',     'name' => 'Geetha Balasubramanian', 'role' => 'team_member'],
            ['username' => 'naveen',     'name' => 'Naveen Kumar',           'role' => 'team_member'],
            ['username' => 'sangeetha',  'name' => 'Sangeetha Venkat',       'role' => 'team_member'],
            ['username' => 'dinesh',     'name' => 'Dinesh Karthikeyan',     'role' => 'team_member'],
            ['username' => 'vani',       'name' => 'Vani Srinivasan',        'role' => 'team_member'],
            ['username' => 'bala',       'name' => 'Bala Murugan',           'role' => 'team_member'],
            ['username' => 'shruthi',    'name' => 'Shruthi Devi',           'role' => 'team_member'],
            ['username' => 'ravi.k',     'name' => 'Ravi Kannan',            'role' => 'team_member'],
            ['username' => 'padma',      'name' => 'Padma Priya',            'role' => 'team_member'],
            ['username' => 'senthil',    'name' => 'Senthil Nathan',         'role' => 'team_member'],
            ['username' => 'uma',        'name' => 'Uma Maheshwari',         'role' => 'team_member'],
            ['username' => 'vivek',      'name' => 'Vivek Ramasamy',         'role' => 'team_member'],
            ['username' => 'janani',     'name' => 'Janani Gopinath',        'role' => 'team_member'],
            ['username' => 'ashok',      'name' => 'Ashok Pandian',          'role' => 'team_member'],
            ['username' => 'bhavani',    'name' => 'Bhavani Shankar',        'role' => 'team_member'],
            ['username' => 'mohan',      'name' => 'Mohan Raj',              'role' => 'team_member'],
            ['username' => 'saranya',    'name' => 'Saranya Devi',           'role' => 'team_member'],
            ['username' => 'vinoth',     'name' => 'Vinoth Kumar',           'role' => 'team_member'],
            ['username' => 'indira',     'name' => 'Indira Ganesan',         'role' => 'team_member'],
            ['username' => 'prakash',    'name' => 'Prakash Raj',            'role' => 'team_member'],
            ['username' => 'sowmya',     'name' => 'Sowmya Narayan',         'role' => 'team_member'],
            ['username' => 'hari',       'name' => 'Hari Prasad',            'role' => 'team_member'],
            ['username' => 'mythili',    'name' => 'Mythili Saravanan',      'role' => 'team_member'],
            ['username' => 'arjun',      'name' => 'Arjun Balaji',           'role' => 'team_member'],
            ['username' => 'dhanya',     'name' => 'Dhanya Ramachandran',    'role' => 'team_member'],
            ['username' => 'prem',       'name' => 'Prem Anand',             'role' => 'team_member'],
            ['username' => 'vaishali',   'name' => 'Vaishali Shukla',        'role' => 'team_member'],
            ['username' => 'gopal',      'name' => 'Gopal Krishnan',         'role' => 'team_member'],

            // ── Viewers / Stakeholders (15) ──
            ['username' => 'sundar',     'name' => 'Sundar Pichai',          'role' => 'viewer'],
            ['username' => 'rekha',      'name' => 'Rekha Menon',            'role' => 'viewer'],
            ['username' => 'kumar.s',    'name' => 'Kumar Sangakkara',       'role' => 'viewer'],
            ['username' => 'radha',      'name' => 'Radha Krishnan',         'role' => 'viewer'],
            ['username' => 'venkat',     'name' => 'Venkataraman Iyer',      'role' => 'viewer'],
            ['username' => 'chitra',     'name' => 'Chitra Subramanian',     'role' => 'viewer'],
            ['username' => 'balaji',     'name' => 'Balaji Srinivasan',      'role' => 'viewer'],
            ['username' => 'kamala',     'name' => 'Kamala Devi',            'role' => 'viewer'],
            ['username' => 'rajan',      'name' => 'Rajan Pillai',           'role' => 'viewer'],
            ['username' => 'savitha',    'name' => 'Savitha Rao',            'role' => 'viewer'],
            ['username' => 'shankar',    'name' => 'Shankar Mahadevan',      'role' => 'viewer'],
            ['username' => 'vidya',      'name' => 'Vidya Balan',            'role' => 'viewer'],
            ['username' => 'girish',     'name' => 'Girish Karnad',          'role' => 'viewer'],
            ['username' => 'malini',     'name' => 'Malini Parthasarathy',   'role' => 'viewer'],
            ['username' => 'tamilselvan','name' => 'Tamilselvan Murugan',    'role' => 'viewer'],
        ];

        foreach ($users as $data) {
            $roleSlug = $data['role'];
            unset($data['role']);

            $data['email'] = $data['username'] . '@wave.local';
            $data['password'] = 'password123';

            $user = User::create($data);
            $user->roles()->attach($roles[$roleSlug]->id);
        }
    }
}
