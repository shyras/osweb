<?php if (!defined('BASEPATH')) die();

class Group extends Main_Controller
{
	// Returns the status of a group
	//
	// Checks the status of an entire group (this is done in the pause screen of the questionnaire).
	// If all the studets have completed the task, the field data_available becomes 1 (true) with the
	// group_task table. This value is returned by this function
	//
	// POST request parameters:
	// - group_id (the database ID of the group)
	// - task_number (the number of the task)
	//
	public function get_status()
	{
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Request-Headers: X-Requested-With, X-Prototype-Version");

		$this->load->model('group_model');
		$group_id = $this->input->post('group_id');
		$task_number = $this->input->post('task_number');
		$result = $this->group_model->get_status($group_id, $task_number);
		
    
    echo json_encode($result);
	}

	// Returns the combined task data for a given task for all the students in a specific group.
	//
	// POST request parameters:
	// - group_id (the database ID of the group)
	// - task_number (the number of the task)
	//
	public function get_task_data()
	{
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Request-Headers: X-Requested-With, X-Prototype-Version");

    $result = "{ok}";

    return json_encode($result);

/* 		$this->load->model('group_model');
		$group_id = $this->input->post('group_id');
		$task_number = $this->input->post('task_number');
		$result = $this->group_model->get_task_data($group_id, $task_number);
		echo json_encode($result); */
	}
}

?>