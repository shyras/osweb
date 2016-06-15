<?php if (!defined('BASEPATH')) die();

class Home extends Main_Controller
{
	// CodeIgniter Documentation page:
	// https://ellislab.com/codeigniter/user-guide/toc.html
	//
	// De Table of contents zit altijd wat weggestopt, rechtsboven in het scherm
	// http://www.codeigniter.com/user_guide/

	// De database configuratie staat in: <root>\intropsy\website\application\config

	// Homepage
	public function index()
	{
		$template_data = array();

		// Loads templates from the directory:
		// <root>\intropsy\website\application\views
		// Template files have a .php extension!

		$this->load->view('include/header');
		$this->load->view('index', $template_data);
		$this->load->view('include/footer');
	}

	// Another example of a URL endpoint.
	// Location: <URL>/index.php?/home/example
	//
	// Shows how to receiev POST parameters 'id' and 'password'
	// and call a method of a model
	public function example()
	{
		// Load the user model
		$this->load->model('user_model');

		// POST data
		$user_id  = trim($this->input->post('id'));
		$password = trim($this->input->post('password'));

		// Use a method in the user model. Always returns "True"
		$valid_user = $this->user_model->login_check($user_id, $password);


		echo 'Valid user? ' . $valid_user;
	}


/*

The code below is left for now as examples of
CodeIgniter controller endpoints



	// Displays the dashboard/graph after the user has logged in
	public function dashboard()
	{
		$this->_authenticate();

		$this->load->model('measurement_model');

		$user = $this->session->userdata('user');

		$smartbridge_id = $user['smartbridge_eui64'];
		$available_weeks = $this->measurement_model->available_weeks($smartbridge_id);

		$template_data = array();
		$template_data['available_weeks']    = $available_weeks;
		$template_data['user']               = $user;
		$template_data['name']               = ucfirst($user['name']);
		$template_data['total_savings']      = $user['total_savings'];
		$template_data['pretest_percentage'] = $user['pretest_percentage'];

		$this->load->view('include/header');
		$this->load->view('dashboard_base', $template_data);
		$this->load->view('include/footer', $template_data);
	}

	// Endpoint for the 'energietips' page
	public function energietips()
	{
		$this-> _authenticate();

		$this->load->model('user_model');

		$user = $this->session->userdata('user');

		// Register the fact that a user has visited this page
		$this->user_model->register_energietips_visit($user['smartbridge_eui64']);

		$template_data = array();
		$template_data['user'] = $user;

		$this->load->view('include/header');
		$this->load->view('energietips', $template_data);
		$this->load->view('include/footer');
	}

	// Endpoint for the 'activatie' page
	public function activatie()
	{
		$template_data = array('email' => '');

		// After an account reset, prefill the e-mail address if possible
		if ($this->session->flashdata('email'))
		{
			$template_data['email'] = $this->session->flashdata('email');
		}

		if ($this->input->server('REQUEST_METHOD') == 'POST')
		{
			$email    = trim($this->input->post('email'));
			$password = trim($this->input->post('password'));
			$confirm  = trim($this->input->post('password_confirm'));

			if ( ($email == '') || ($password == '') || ($confirm == ''))
			{
				// >1 of the input fields was empty
				$template_data['EMPTY_FIELDS'] = true;
				$template_data['email'] = $email;
			}
			else
			{
				// All input fields entered, check if the e-mail address exists
				$this->load->model('user_model');
				$account_exists = $this->user_model->account_exists($email);

				if ($account_exists)
				{
					// Valid, existing e-mail address

					// Check if the account was already activated
					$account_activated = $this->user_model->account_activated($email);

					if ($account_activated)
					{
						// The account has already been activated
						$template_data['ACCOUNT_ALREADY_ACTIVE'] = true;
					}
					else
					{
						// The account has not yet been activated

						// Check if the password and the password confirmation match
						if ($password == $confirm)
						{
							// Matching passwords, activate the account by setting the password
							$this->user_model->activate_account($email, $password);

							// Redirect the user to the login page
							$this->session->set_flashdata('ACCOUNT_ACTIVATED', true);

							redirect(base_url());
						}
						else
						{
							// Not matching
							$template_data['CONFIRM_FAIL'] = true;
							$template_data['email'] = $email;
						}
					}
				}
				else
				{
					// Unknown e-mail address
					$template_data['ACCOUNT_UNKNOWN'] = true;
					$template_data['email'] = $email;
				}
			}
		}

		$this->load->view('include/header');
		$this->load->view('activatie', $template_data);
		$this->load->view('include/footer');
	}

	// Endpoint for the 'uitleg' page
	public function uitleg()
	{
		$this-> _authenticate();

		$this->load->model('user_model');

		$user = $this->session->userdata('user');
		$template_data['user'] = $user;

		// Register the fact that a user has visited this page
		$this->user_model->register_uitleg_visit($user['smartbridge_eui64']);

		$this->load->view('include/header');
		$this->load->view('uitleg', $template_data);
		$this->load->view('include/footer');
	}

	// Endpoint for the 'contact' page
	public function contact()
	{
		$user = $this->session->userdata('user');
		$template_data = array();

		$this->load->view('include/header');
		$this->load->view('contact', $template_data);
		$this->load->view('include/footer');
	}

	// Endpoint for the 'password reset' page
	public function password_reset()
	{
		$template_data = array('email' => '');

		if ($this->input->server('REQUEST_METHOD') == 'POST')
		{
			$email = trim($this->input->post('email'));
			$smartbridge_suffix = trim($this->input->post('smartbridge_suffix'));

			if ( ($email == '') || ($smartbridge_suffix == '') )
			{
				// >1 of the input fields was empty
				$template_data['EMPTY_FIELDS'] = true;
				$template_data['email'] = $email;
			}
			else
			{
				// All input fields entered, check if the e-mail address exists
				$user = $this->session->userdata('user');
				$this->load->model('user_model');
				$account_exists = $this->user_model->account_exists($email);

				if ($account_exists)
				{
					// Valid, existing e-mail address. Compare the smartbridge suffix
					if ($this->user_model->check_smartbridge_suffix($email, $smartbridge_suffix))
					{
						if ($this->user_model->reset_account($email))
						{
							// Redirect the user to the activation page
							$this->session->set_flashdata('ACCOUNT_RESET', true);
							$this->session->set_flashdata('email', $email);

							redirect(site_url('home/activatie'));
						}
					}
					else
					{
						// Invalid e-mail address / smartbridge suffix combination
						$template_data['INVALID_CREDENTIALS'] = true;
						$template_data['email'] = $email;
					}
				}
				else
				{
					// Unknown e-mail address
					$template_data['ACCOUNT_UNKNOWN'] = true;
					$template_data['email'] = $email;
				}
			}
		}
		else
		{
		}

		$this->load->view('include/header');
		$this->load->view('password_reset', $template_data);
		$this->load->view('include/footer');
	}

	// Endpoint for the 'logout' link
	public function logout()
	{
		$this->session->set_userdata('logged_in', false);
		$this->session->set_userdata('user', null);

		redirect('/', 'refresh');
	}

	// Endpoint for loading the graph data
	public function graphdata($year, $week)
	{
		// Use localized time labels
		setlocale(LC_TIME, 'nl_NL');

		$this-> _authenticate();

		$this->load->model('measurement_model');
		$this->load->library('smartgrid');

		$user = $this->session->userdata('user');
		$smartbridge_id = $user['smartbridge_eui64'];

		// Retrieve the measurements for the specified year and week
		$graph_data = $this->measurement_model->get_graph_data($smartbridge_id, $year, $week);

		// Make a time series for the graph based on all pre-processed data
		$labels    = array();
		$series    = array();
		$drilldown = array();

		$weekdays = array('Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag');

		foreach ($graph_data as $day)
		{
			// Extract the dates so they can be used as graph labels
			$date = $day['date'];
			$day_of_week = strftime("%w", strtotime($date));
			$day_name = $weekdays[$day_of_week];

			$date = strftime("%d-%m-%Y", strtotime($date));
			$labels[] = $date . '<br>' . $day_name;
			$drilldown[$date] = $day['measurements'];

			// Calculate the sum totals of the day parts
			$hourly_values = json_decode($day['measurements'], true);
			$dayparts = $this->smartgrid->extract_dayparts($hourly_values);

			$series[0]['name']   = 'Super zonnekorting';
			$series[0]['level']  = 0;
			$series[0]['date']   = $date;
			$series[0]['data'][] = $dayparts['superkorting'];

			$series[1]['name']   = 'Zonnekorting';
			$series[1]['level']  = 0;
			$series[1]['date']   = $date;
			$series[1]['data'][] = $dayparts['korting'];

			$series[2]['name']   = 'Geen korting';
			$series[2]['level']  = 0;
			$series[2]['date']   = $date;
			$series[2]['data'][] = $dayparts['geen_korting'];

			$series[3]['name']   = 'Kortings afname';
			$series[3]['level']  = 0;
			$series[3]['date']   = $date;
			$series[3]['data'][] = $dayparts['strafkorting'];
		}

		// Also retrieve the weekly totals for the specified year and week
		$weekly_totals = $this->measurement_model->get_weekly_totals($smartbridge_id, $year, $week);

		$result = array(
			'labels'     => $labels,
			'series'     => $series,
			'drilldown'  => $drilldown,
			'week_totals'=> $weekly_totals,
			'debug'      => $dayparts,
		);

		// Return the pre-processed data
		print json_encode($result);
	}
*/

	//------------------------------------------------------------------------
	// Private support methods
	//------------------------------------------------------------------------

	// Check if a user is logged in. If not, redirect to the homepage
	private function _authenticate()
	{
		if ($this->session->userdata('logged_in') == null || $this->session->userdata('logged_in') != 1)
		{
			redirect(base_url());
		}
	}
}

?>