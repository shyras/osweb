OpenSesame = {
    API: 2,
    OpenSesame: "3.1.6",
    Platform: "nt",
    Experiment: {
        width: 1024,
        uniform_coordinates: true,
        title: "Conditional",
        subject_parity: 'even',
        subject_nr: 0,
        start: "experiment",
        sound_sample_size: -16,
        sound_freq: 48000,
        sound_channels: 2,
        sound_buf_size: 1024,
        sampler_backend: "legacy",
        round_decimals: 2,
        mouse_backend: "legacy",
        keyboard_backend: "legacy",
        height: 768,
        fullscreen: false,
        form_clicks: false,
        foreground: "white",
        font_underline: false,
        font_size: 18,
        font_italic: false,
        font_family: "mono",
        font_bold: false,
        experiment_path: "D:/",
        disable_garbage_collection: true,
        description: "The main experiment item",
        coordinates: "uniform",
        compensation: 0,
        color_backend: "legacy",
        clock_backend: "legacy",
        canvas_backend: "legacy",
        bidi: false,
        background: "black",
        items: [{ 
            type: "sampler",
            name: "correct_sound",
	        volume: 1,
	        stop_after: 0,
	        sample: "0863.ogg",
	        pitch: 1,
	        pan: 0,
	        fade_in: 0,
	        duration: 0,
	        description: "Plays a sound file in .wav or .ogg format" 
        },{
            type: "feedback",
            name: "eval_dot",
            reset_variables: true,
	        duration: 500,
	        description: "Provides feedback to the participant",
            elements: [{
                type: "fixdot", 
                color: "#05ff00", 
                show_if: "[correct] = 1", 
                style: "default", 
                x: 0, 
                y: 0,
                z_index: 0
            },{     
	            type: fixdot, 
                color: "#ff000b",
                show_if: "[correct] = 0", 
                style: "default", 
                x: 0, 
                y: 0,
                z_index: 0
            }]
        },{
            type: "sequence",
            name: "experiment",
        	flush_keyboard: true,
	        description: "Runs a number of items in sequence",
	        items: [{
                item: "getting_started",
                cond: "always"
            },{
                item: "sound_test",
                cond: "always"
            },{
                item: "welcome",
                cond: "always"
            },{
                item: "trials",
                cond: "always"
            }]        
        },{
            type: "notepad",
            name: "getting_started",
        	note: [
                "Welcome to OpenSesame 3.1 'Jazzy James'!",
	            "If you are new to OpenSesame, it is a good idea to follow one of the tutorials,",
	            "which can be found on the documentation site:",
	            "- <http://osdoc.cogsci.nl/>",
	            "You can also check out the examples. These can be opened via:",
	            "- Menu -> Tools -> Example experiments.",
	            "And feel free to ask for help on the forum:",
	            "- <http://forum.cogsci.nl/>",
	            "Have fun with OpenSesame!"],
	        description: "A simple notepad to document your experiment. This plug-in does nothing."
        },{
            type: "sampler",
            name: "incorrect_sound",
	        volume: 1,
	        stop_after: 0,
	        sample: "0477.ogg",
	        pitch: 1,
	        pan: 0,
	        fade_in: 0,
	        duration: 0,
	        description: "Plays a sound file in .wav or .ogg format"
        },{
            type: "logger",
            name: "log",
	        description: "Logs experimental data",
	        auto_log: true
        },{
            type: "sketchpad",
            name: "press_for_next",
        	duration: "keypress",
	        description: "Displays stimuli",
            elements: [{
                type: "textline",
                center: true,
                color: "white", 
                font_bold: false, 
                font_family: "mono", 
                font_italic: false,
                font_size: 18, 
                html: true, 
                show_if: "always", 
                text: "GO!",
                x: 0, 
                y: 0,
                z_index: 0
            }]    
        },{
            type: "keyboard_response",
            name: "resp",
	        timeout: "infinite",
	        flush: true,
	        duration: "keypress",
	        description: "Collects keyboard responses",
	        allowed_responses: "left;right"
        },{
            type: "sampler",
            name: "sound_test",
	        volume: 1,
	        stop_after: 0,
	        sample: "0564.ogg",
	        pitch: 1,
	        pan: 0,
	        fade_in: 0,
	        duration: 0,
	        description: "Plays a sound file in .wav or .ogg format"
        },{
            type: "sketchpad",
            name: "stim",
	        duration: 0,
	        description: "Displays stimuli",
	        elements: [{
                center: 1, 
                color: "white", 
                font_bold: true, 
                font_family: "Myriad Pro",
                font_italic: false, 
                font_size: 25,
                html: true,
                show_if: "always", 
                text: "[stim]",
                x: 0,
                y: 0,
                z_index: 0
            }]    
        },{
            type: "sequence",
            name: "trial_sequence",
	        flush_keyboard: true,
	        description: "Runs a number of items in sequence",
	        items: [{
                item: "stim",
                cond: "always"
            },{    
                item: "log",
                cond: "always"
	        },{    
                item: "correct_sound",
                cond: "[correct] = 1"
	        },{    
                item: "incorrect_sound",
                cond: "[correct] = 0"
	        },{    
                item: "eval_dot",
                cond: "always"
	        },{    
                item: "press_for_next",
                cond: "always"
            }]    
        },{
            type: "loop",
            name: "trials",
	        source_file: "",
	        source: "table",
	        repeat: 5,
	        order: "random",
	        description: "Repeatedly runs another item",
	        cycles: 2,
	        continuous: false,
	        break_if_on_first: true,
	        break_if: "never",
            colums: [
                "stim",
                "correct_response"
            ],    
            rows: [{
                row: 0,
                values: [
                    "RIGHT",
	                "right"
                ]   
            },{     
                row: 1,
                values: [
                    "LEFT",
	                "left"
                ]    
            }],                 
	        run: "trial_sequence"
        },{
            type: "sketchpad",
            name: "welcome",
	        start_response_interval: false,
	        reset_variables: false,
	        duration: "keypress",
	        description: "Displays stimuli",
	        elements: [{
                type: "textline",
                center: true,
                color: "white", 
                font_bold: false, 
                font_family: "serif", 
                font_italic: false,
                font_size: 26, 
                html: true, 
                show_if: "always", 
                text: "<h2>This is an OS Web test experiment</h2><br/> It tests if conditional statements in the 'run-if' boxes work. <br/>Press they arrow key that is indicated on the screen. <br/>If you press the wrong direction, <br/>you should hear a different sound than when you press the right direction.<br/>You should also see a red fixation dot after a wrong response, <br/>and a green after a right one.",
                x: 0,
                y: 0,
                z_index: 0
            },{
                type: "textline", 
                center: true, 
                color: "white",
                font_bold: false,
                font_family: "serif", 
                font_italic: false, 
                font_size: 26, 
                html: true,
                show_if: "always", 
                text: "[subject_nr]", 
                x: 0,
                y: 256, 
                z_index: 0
            }]    
        }],    
        pool: [{
            name: '0477.ogg',
            type: 'image',
            data: ''
        },{
            name: '0564.ogg',
            type: 'image',
            data: ''
        },{
            name: '0863.ogg',
            type: 'image',
            data: ''
        }]        
    }
}