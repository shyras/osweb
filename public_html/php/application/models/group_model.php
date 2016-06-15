<?php

class Group_model extends CI_Model
{
	public function __construct()
	{
		parent::__construct();
	}

	// Returns the status of a group
	//
	// Checks the status of an entire group (this is done in the pause screen of the questionnaire).
	// If all the studets have completed the task, the field data_available becomes 1 (true) with the
	// group_task table. This value is returned by this function
	public function get_status($group_id, $task_number)
	{
		$this->db->select('task_available, data_available, file_available');
		$this->db->where('group_id', $group_id);
		$this->db->where('task_number', $task_number);
		$this->db->limit(1);
		$query = $this->db->get('group_task');

		if ($query->num_rows() == 1)
		{
			return $query->row();
		}

		return 0;
	}

	// Returns the task data of a group
	//
	// Retrieves the entire data structure for a given group and task.
	//
	public function get_task_data($group_id, $task_number)
	{
		$this->db->select('student_task_id, student_id, group_id, task_number, task_data');
		$this->db->where('group_id', $group_id);
		$this->db->where('task_number', $task_number);

		$query = $this->db->get('student_task');

		return $query->result_array();
	}
}

?>