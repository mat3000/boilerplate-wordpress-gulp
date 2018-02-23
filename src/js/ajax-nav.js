import $ from 'jquery';

export default class AjaxNav {

	constructor(options){

		this.domain = window.location.origin;

		this.container = $(options.container);
		this.link = $(options.link);
		this.page = null;

		this.link.on('click', function (e) {

			e.preventDefault();
	        
	        let href = $(this).attr('href');
	        
	        href = href.replace(/^http(s?):\/\/(.*)\.[a-z]{1,3}\//g, '')

	        window.location.hash = href;

		});

	}

	load(page, callback){

		if(this.page===page) return;
		if(!page||page==='/') return;
        if(callback) callback(0);

        this.page = page;

		$.ajax({
            url: this.domain+'/'+page,
            type: 'GET',
            dataType: 'html',
            data: {ajax: 1}
        })
        .done((data) => {

        	this.container.html(data);

        	let $img = $('img', this.container);
            let imgLength = $img.length;
            let index = 0;

            if(imgLength){

                for (let i = 0; i < imgLength; i++) {

                    let $this = $($img[i]);

                    $this.one('load', function(){

                        let progress = 100 / imgLength * ++index / 100;

            			if(callback) callback(progress);

                    }).one("error", function(){

                    	$(this).attr( "src", "http://media.matdev.fr/?i=0&t=number&sleep=2");

                    }).attr('src', $this.attr('src'));

                    if($img[i].complete) $this.on('load');

                };

            }else{

            	if(callback) callback(1);

            }

        })
        .fail((data) => {

            if(callback) callback(1);
        	this.container.html(data.responseText);

        });

	}

};