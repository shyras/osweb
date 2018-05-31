# OSWEB

Copyright 2016 Jaap Bos (@shyras)

## About

OSWEB is an online runtime for OpenSesame experiments. OpenSesame is a open-source program for creating behavioral experiments. For more information, see:

- <http://osdoc.cogsci.nl/>

## How to build

OSWeb is built using node.js and webpack, and therefore the installation process should be pretty straightforward:

First, go to the root of the OSWEB folder and install the dependencies with the command:

    npm install

Then build OSWEB by running:

    npm run dev

This will generate the application in the `public_html` folder.

If you want to build OSweb with production settings you can run:

    npm run prod

The production version is uglified and minified, which results in smaller file sizes, and thus shorter loading times when serving Osweb from a web server. The building process does take considerably longer because of these steps.

## How to run

Open `public_html/index.html` in a webbrowser!

Alternatively, you can start a development server with:

    npm start

Once the development server is started, you can visit `http://localhost:8080` in your browser and you should see the osweb interface. The devserver is especially useful if you are working on the source of osweb itself, because it employs hot module reloading (HMR). This implies that whenever you change a file and save it to disk, it is automatically reloaded in the browser.

## Unit tests

Unit tests can be run with

    npm test

## License

OSWEB is distributed under the terms of the GNU General Public License 3. The full license should be included in the file COPYING, or can be obtained from:

- <http://www.gnu.org/licenses/gpl.txt>
