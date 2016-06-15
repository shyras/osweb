<?php

class Student_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();

		// LDAP Server address
		$this->LDAP_SERVER    = 'ldaps://sv1.id.rug.nl';
		$this->LDAP_CONTAINER = 'ou=gmwfiletransfer,o=asds';	// GMW CONTAINER

		// Switch for LDAP check during login
		$host = (isset($_SERVER["HTTP_HOST"])) ? $_SERVER["HTTP_HOST"] : '';

		if ((strlen(trim($host)) == 0) || ($host == 'www.gmw.rug.nl'))
		{
			// GMW server
			$this->LDAP_CHECK_ENABLED = true;
		}
		else
		{
			// Localhosts
			$this->LDAP_CHECK_ENABLED = false;
		}
	}

	// Performs a login check for a student
	public function login($student_number, $password)
	{
		$this->load->model('log_model');

		// Remove whitespace and convert to uppercase
		$student_number = $this->clean_student_number($student_number);

		// No matter what the LDAP setting is, never perform an LDAP check
		// on an account starting with a 't'. Accounts starting with a 't'
		// are special test accounts.
		if (!$this->startsWith(strtoupper($student_number), 'T'))
		{
			// Perform an LDAP check if enabled
			if ($this->LDAP_CHECK_ENABLED)
			{
				$ldap_result = $this->ldap_check($student_number, $password);

				if (!$ldap_result)
				{
					// Not a valid student number/password combination
					return array();
				}
			}
		}

		// LDAP check was skipped or returned a valid account. Check local database next.
		$this->db->select('student_id, group_id, student_number, student_name, student_email, task1_status, task2_status, task3_status, task4_status, task5_status');
		$this->db->where('student_number', $student_number);
		$this->db->limit(1);
		$query = $this->db->get('student');

		// Invalid login
		if ($query->num_rows() != 1)
		{
			return array();
		}

		// Valid login
		$student  = $query->row_array();
		$group_id = $student['group_id'];

		// still needed?
		// $student['tasks_available'] = $this->get_available_tasks_and_data($group_id);

		// IP check
		$ip_address = $_SERVER['REMOTE_ADDR'];
		$student['ip_address'] = $ip_address;
		$student['ip_allowed'] = (preg_match('/^129\.125.*/', $student['ip_address']) ? true : false);

		// Record the login attempt
		$this->log_model->record_login($student_number, $group_id, $ip_address);

		return $student;
	}

	// Sets the task status of a student
	public function set_task_status($student_number, $task_number, $task_status)
	{
		$task_field = 'task' . $task_number . '_status';

		$this->db->set($task_field, $task_status);
		$this->db->where('student_number', $student_number);
		$this->db->limit(1);
		$query = $this->db->update('student');

		$result = array('status' => 'ERR');
		if ($this->db->affected_rows() == 1)
		{
			$result['status'] = 'OK';
		}

		return $result;
	}

	// Save the task data of a student
	public function save_task_data($student_number, $group_id, $task_number, $task_data)
	{
		date_default_timezone_set('Europe/Amsterdam');
		$moment = date('Y-m-d G:i:s');

		$this->db->set('student_number', $student_number);
		$this->db->set('group_id', $group_id);
		$this->db->set('task_number', $task_number);
		$this->db->set('task_data', $task_data);
		$this->db->set('date', $moment);

		$query = $this->db->insert('student_task');

		$result = array('status' => 'ERR');
		if ($this->db->affected_rows() == 1)
		{
			$result['status'] = 'OK';
		}

		return $result;
	}

	//------------------------------------------------------------------------
	//	Support methods
	//------------------------------------------------------------------------

	// Performs an LDAP check on the student container
	// Returns True or False
	private function ldap_check($student_number, $password)
	{
		$container = 'cn=' . $student_number . ',' . $this->LDAP_CONTAINER;
		$ldap_conn = @ldap_connect($this->LDAP_SERVER);
		$ldap_bind = @ldap_bind($ldap_conn, $container, $password);

		if ($ldap_bind)
		{
			// Valid account
			return true;
		}

		return false;
	}

	// Checks if a string starts with a certain string
	private function startsWith($haystack, $needle)
	{
		return strpos($haystack, $needle) === 0;
	}

	// Cleans and standardizes student number input as much as possible
	private function clean_student_number($student_number)
	{
		// We will not automaticall add an 'S' here if it is missing, because
		// that would collide with the test for test account starting with a 'T'
		return trim(strtoupper($student_number));
	}
}

?>