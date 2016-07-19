# OSWEB

Copyright 2016 Jaap Bos (@shyras)

## About

OSWEB is an online runtime for OpenSesame experiments. OpenSesame is a open-source program for creating behavioral experiments. For more information, see:

- <http://osdoc.cogsci.nl/>

## How to build

First, install `gulp` through the [node.js](https://nodejs.org/en/download/) package manager:

	npm install -g gulp-cli

Next, go to the OSWEB folder and install the dependencies:

	npm install

Finally, build OSWEB by running:

	gulp js
	gulp css

This will generate:

	public_html/css/osweb.css
	public_html/js/osweb.js

## How to run

Open `public_html/index.html` in a webbrowser!

## License

OSWEB is distributed under the terms of the GNU General Public License 3. The full license should be included in the file COPYING, or can be obtained from:

- <http://www.gnu.org/licenses/gpl.txt>
