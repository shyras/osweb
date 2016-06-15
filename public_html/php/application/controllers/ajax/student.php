<?php if (!defined('BASEPATH')) die();

class Student extends Main_Controller
{
	// Student login
	//
	// If the login is successful, a JSON structure containing information about
	// the student is returned. This includes student name, group_id, the status
	// of each task for this student. A login failure returns an error.
	//
	// POST request parameters:
	// - student_number (the student number of the student)
	// - password (the password of the student)
	//
	public function login()
	{
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Request-Headers: X-Requested-With, X-Prototype-Version");

		$this->load->model('student_model');
		$student_number = $this->input->post('student_number');
		$password       = $this->input->post('password');

		// Hard-coded Test
		$student_number = 't251108';
		$password = 'test';

		echo $student_number;
		echo '<br>';
		echo $password;

		$result = $this->student_model->login($student_number, $password);
		echo json_encode($result);
	}

	// Set task status
	//
	// Sets the status of a task for a given student
	//
	// POST request parameters:
	// - student_number (the studentnumber)
	// - task_number (the number of the task)
	// - task_status (the task status value that should be set)
	//
	// Task status values:
	//
	// 0: No actions have been performed
	// 1: Task section has started
	// 2: Task section has finished
	// 3: Questions section has started
	// 4: Questions section has finished
	//
	// This method is called at multiple moments during the course session.
	public function set_task_status()
	{
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Request-Headers: X-Requested-With, X-Prototype-Version");

		$this->load->model('student_model');
		$student_number = $this->input->post('student_number');
		$task_number = $this->input->post('task_number');
		$task_status = $this->input->post('task_status');
		$result = $this->student_model->set_task_status($student_number, $task_number, $task_status);
		echo json_encode($result);
	}

	// Save task data
	//
	// Saves the task data for a given student
	//
	// POST request parameters:
	// - student_number (the studentnumber)
	// - group_id (the database ID of the group)
	// - task_number (the number of the task)
	// - task_data (the task data that should be stored)
	//
	public function save_task_data()
	{
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Request-Headers: X-Requested-With, X-Prototype-Version");

		$this->load->model('student_model');
		$student_number = $this->input->post('student_number');
		$group_id    = $this->input->post('group_id');
		$task_number = $this->input->post('task_number');
		$task_data   = $this->input->post('task_data');
		$result = $this->student_model->save_task_data($student_number, $group_id, $task_number, $task_data);
		echo json_encode($result);
	}
}

?>