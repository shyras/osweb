<?php

class Log_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
	}

	// Records a login
	public function record_login($student_number, $group_id, $ip_address)
	{
		date_default_timezone_set('Europe/Amsterdam');
		$login_time = date("Y-m-d G:i:s");

		$this->db->set('student_number', $student_number);
		$this->db->set('group_id', $group_id);
		$this->db->set('ip_address', $ip_address);
		$this->db->set('date', $login_time);
		$this->db->insert('logins');
	}
}

?>