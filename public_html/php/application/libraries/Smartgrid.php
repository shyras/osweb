<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Smartgrid
{
	// Extract the total of all the desired dayparts from the measurements of a particular day
	public function extract_dayparts(&$hourly_values)
	{
		// Split up the measurements in various dayparts
		//
		// http://www.php.net/manual/en/function.array-slice.php
		// array_slice ( array $array , int $offset [, int $length = NULL [, bool $preserve_keys = false ]] )
		// Notice the third parameter!
		$geen_korting = 0;
		$korting      = 0;
		$superkorting = 0;
		$strafkorting = 0;

		$geen_korting += array_sum(array_slice($hourly_values, 0,  9, true));		// 00:00 - 09:00 [x] Geen korting
		$korting      += array_sum(array_slice($hourly_values, 9,  2, true));		// 09:00 - 11:00 [x] Korting
		$superkorting += array_sum(array_slice($hourly_values, 11, 2, true));		// 11:00 - 13:00 [x] Superkorting
		$korting      += array_sum(array_slice($hourly_values, 13, 4, true));		// 13:00 - 17:00 [x] Korting
		$strafkorting += array_sum(array_slice($hourly_values, 17, 4, true));		// 17:00 - 21:00 [x] Strafkorting
		$geen_korting += array_sum(array_slice($hourly_values, 21, null, true));	// 21:00 - 00:00 [x] Geen Korting

		return array('geen_korting' => round($geen_korting / 1000, 1),
					 'korting'      => round($korting      / 1000, 1),
					 'superkorting' => round($superkorting / 1000, 1),
					 'strafkorting' => round($strafkorting / 1000, 1)
		);
	}
}

// Example/reference data to help determine offsets
// hourly_values:
// [462.31,468.59,456.45,425.84,384.6,399.9,405.65,434.57,413.25,549.18,414.84,367.28,370.91,523.97,698.81,355.99,488.78,532.12,496.33,488.76,572.81,488.03,636.12,397.76]

//	Value		0-based	1-based	-period
//
//	462.31,		0		1		00-01
//	468.59,		1		2		01-02
//	456.45,		2		3		02-03
//	425.84,		3		4		03-04
//	384.6,		4		5		04-05
//	399.9,		5		6		05-06
//	405.65,		6		7		06-07
//	434.57,		7		8		07-08
//	413.25,		8		9		08-09
//	549.18,		9		10		09-10
//	414.84,		10		11		10-11
//	367.28,		11		12		11-12
//	370.91,		12		13		12-13
//	523.97,		13		14		13-14
//	698.81,		14		15		14-15
//	355.99,		15		16		15-16
//	488.78,		16		17		16-17
//	532.12,		17		18		17-18
//	496.33,		18		19		18-19
//	488.76,		19		20		19-20
//	572.81,		20		21		20-21
//	488.03,		21		22		21-22
//	636.12,		22		23		22-23
//	397.76		23		24		23-24

?>