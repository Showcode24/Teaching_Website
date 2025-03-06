/* ===================================================================
    
    Author          : Valid Theme
    Template Name   : Urane - Insurance Company HTML Template 
    Version         : 1.0
    
* ================================================================= */
(function($) {
	"use strict";

	$(document).ready(function() {

		/* ==================================================
		    # Tooltip Init
		===============================================*/
		$('[data-toggle="tooltip"]').tooltip();


		/* ==================================================
		    # Youtube Video Init
		 ===============================================*/
		$('.player').mb_YTPlayer();


		/* ==================================================
		    # Scrolla active
		===============================================*/
		$('.animate').scrolla({
			// default
			mobile: false, // disable animation on mobiles
			once: true // disable animation on mobiles
		});


		/* ==================================================
		    # imagesLoaded active
		===============================================*/
		$('#gallery-masonary,.blog-masonry').imagesLoaded(function() {

			/* Filter menu */
			$('.mix-item-menu').on('click', 'button', function() {
				var filterValue = $(this).attr('data-filter');
				$grid.isotope({
					filter: filterValue
				});
			});

			/* filter menu active class  */
			$('.mix-item-menu button').on('click', function(event) {
				$(this).siblings('.active').removeClass('active');
				$(this).addClass('active');
				event.preventDefault();
			});

			/* Filter active */
			var $grid = $('#gallery-masonary').isotope({
				itemSelector: '.gallery-item',
				percentPosition: true,
				masonry: {
					columnWidth: '.gallery-item',
				}
			});

			/* Filter active */
			$('.blog-masonry').isotope({
				itemSelector: '.blog-item',
				percentPosition: true,
				masonry: {
					columnWidth: '.blog-item',
				}
			});

		});


		/* ==================================================
		    # Fun Factor Init
		===============================================*/
		$('.timer').countTo();
		$('.fun-fact').appear(function() {
			$('.timer').countTo();
		}, {
			accY: -100
		});


		/* ==================================================
		    # Magnific popup init
		 ===============================================*/
		$(".popup-link").magnificPopup({
			type: 'image',
			// other options
		});

		$(".popup-gallery").magnificPopup({
			type: 'image',
			gallery: {
				enabled: true
			},
			// other options
		});

		$(".popup-youtube, .popup-vimeo, .popup-gmaps").magnificPopup({
			type: "iframe",
			mainClass: "mfp-fade",
			removalDelay: 160,
			preloader: false,
			fixedContentPos: false
		});

		$('.magnific-mix-gallery').each(function() {
			var $container = $(this);
			var $imageLinks = $container.find('.item');

			var items = [];
			$imageLinks.each(function() {
				var $item = $(this);
				var type = 'image';
				if ($item.hasClass('magnific-iframe')) {
					type = 'iframe';
				}
				var magItem = {
					src: $item.attr('href'),
					type: type
				};
				magItem.title = $item.data('title');
				items.push(magItem);
			});

			$imageLinks.magnificPopup({
				mainClass: 'mfp-fade',
				items: items,
				gallery: {
					enabled: true,
					tPrev: $(this).data('prev-text'),
					tNext: $(this).data('next-text')
				},
				type: 'image',
				callbacks: {
					beforeOpen: function() {
						var index = $imageLinks.index(this.st.el);
						if (-1 !== index) {
							this.goTo(index);
						}
					}
				}
			});
		});


		/* ==================================================
		    _Progressbar Init
		 ===============================================*/
		function animateElements() {
			$('.progressbar').each(function() {
				var elementPos = $(this).offset().top;
				var topOfWindow = $(window).scrollTop();
				var percent = $(this).find('.circle').attr('data-percent');
				var animate = $(this).data('animate');
				if (elementPos < topOfWindow + $(window).height() - 30 && !animate) {
					$(this).data('animate', true);
					$(this).find('.circle').circleProgress({
						// startAngle: -Math.PI / 2,
						value: percent / 100,
						size: 130,
						thickness: 13,
						lineCap: 'round',
						emptyFill: '#f1f1f1',
						fill: {
							gradient: ['#2667FF', '#6c19ef']
						}
					}).on('circle-animation-progress', function(event, progress, stepValue) {
						$(this).find('strong').text((stepValue * 100).toFixed(0) + "%");
					}).stop();
				}
			});

		}

		animateElements();
		$(window).scroll(animateElements);


		/* ==================================================
            # Banner Carousel
         ===============================================*/
		const bannerFade = new Swiper(".banner-fade", {
			// Optional parameters
			direction: "horizontal",
			loop: true,
			autoplay: true,
			effect: "fade",
			fadeEffect: {
				crossFade: true
			},

			// If we need pagination
			pagination: {
				el: '.swiper-pagination',
				type: 'bullets',
				clickable: true,
			},

			// Navigation arrows
			navigation: {
				nextEl: ".swiper-button-next",
				prevEl: ".swiper-button-prev"
			}

			// And if we need scrollbar
			/*scrollbar: {
            el: '.swiper-scrollbar',
          },*/
		});

		/* ==================================================
            # Services Style One Carousel
         ===============================================*/
		const serviceStyleOne = new Swiper(".services-style-one-carousel", {
			// Optional parameters
			loop: true,
			freeMode: true,
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 50,
			autoplay: false,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".services-cat-next",
				prevEl: ".services-cat-prev"
			},
			breakpoints: {
				768: {
					slidesPerView: 2,
				},
				1200: {
					slidesPerView: 3,
				},
			},
		});

		/* ==================================================
            # Services Style One Carousel
         ===============================================*/
		const serviceStyleTwo = new Swiper(".services-style-two-carousel", {
			// Optional parameters
			loop: true,
			freeMode: true,
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 50,
			autoplay: false,
			pagination: {
				el: ".service-four-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".services-four-next",
				prevEl: ".services-four-prev"
			},
			breakpoints: {
				768: {
					slidesPerView: 2,
				},
				1200: {
					slidesPerView: 4,
				},
			},
		});


		/* ==================================================
            # Testimonial Carousel
         ===============================================*/
		const testimonialOne = new Swiper(".testimonial-style-one-carousel", {
			// Optional parameters
			direction: "horizontal",
			loop: true,
			autoplay: false,

			// Navigation arrows
			navigation: {
				nextEl: ".testimonial-button-next",
				prevEl: ".testimonial-button-prev"
			}

			// And if we need scrollbar
			/*scrollbar: {
            el: '.swiper-scrollbar',
          },*/
		});


		/* ==================================================
            # Services Carousel
         ===============================================*/
		const servicesCarousel = new Swiper(".services-carousel", {
			// Optional parameters
			loop: true,
			freeMode: true,
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 30,
			autoplay: false,
			// If we need pagination
			pagination: {
				el: '.services-pagination',
				type: 'fraction',
				clickable: true,
			},
			// Navigation arrows
			navigation: {
				nextEl: ".services-button-next",
				prevEl: ".services-button-prev"
			},
			breakpoints: {
				800: {
					slidesPerView: 2,
					spaceBetween: 30,
				},
				992: {
					slidesPerView: 3,
					spaceBetween: 30,
				},
				1367: {
					slidesPerView: 3.6,
					spaceBetween: 50,
				},
			},
		});


		/* ==================================================
            # Testimonial Carousel
         ===============================================*/
		var testimonialTwo = new Swiper('.testimonial-style-two-carousel', {
			spaceBetween: 10,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			loop: true,
			loopedSlides: 4
		});
		var testimonialBullet = new Swiper('.testimonial-bullet', {
			spaceBetween: 10,
			slidesPerView: 'auto',
			touchRatio: 0.2,
			slideToClickedSlide: true,
			loop: true,
			loopedSlides: 3,
			centeredSlides: true,
		});
		testimonialTwo.controller.control = testimonialBullet;
		testimonialBullet.controller.control = testimonialTwo;


		/* ==================================================
            # Brand Carousel
         ===============================================*/
		const brandCarousel = new Swiper(".brand-style-two-carousel", {
			// Optional parameters
			loop: true,
			freeMode: true,
			grabCursor: true,
			slidesPerView: 2,
			spaceBetween: 50,
			autoplay: false,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".services-cat-next",
				prevEl: ".services-cat-prev"
			},
			breakpoints: {
				768: {
					slidesPerView: 3,
				},
				992: {
					slidesPerView: 4,
				},
				1700: {
					slidesPerView: 5,
				},
			},
		});


		/* ==================================================
            # Testimonial Carousel
         ===============================================*/
		const testimonialThree = new Swiper(".testimonial-style-three-carousel", {
			// Optional parameters
			loop: true,
			freeMode: true,
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 50,
			autoplay: false,
			pagination: {
				el: ".swiper-pagination",
				clickable: true,
			},
			navigation: {
				nextEl: ".services-cat-next",
				prevEl: ".services-cat-prev"
			},
			breakpoints: {
				768: {
					slidesPerView: 2,
				},
				1200: {
					slidesPerView: 3,
				}
			},
		});


		/* ==================================================
		    Range Slider
		================================================== */
		let rangeSlider = document.querySelector("#slider-range");
		if (rangeSlider) {
			$("#slider-range").slider({
				range: true,
				min: 0,
				max: 100000,
				values: [50000, 100000],
				slide: function(event, ui) {
					$("#amount").val("$" + ui.values[0]);
				}
			});
			$("#amount").val("$" + $("#slider-range").slider("values", 0));
		}


		let rangeSlider_2 = document.querySelector("#slider-range-2");
		if (rangeSlider_2) {
			$("#slider-range-2").slider({
				range: true,
				min: 0,
				max: 100000,
				values: [50000, 100000],
				slide: function(event, ui) {
					$("#amount-2").val("$" + ui.values[0]);
				}
			});
			$("#amount-2").val("$" + $("#slider-range-2").slider("values", 0));
		}


		let rangeSlider_3 = document.querySelector("#slider-range-3");
		if (rangeSlider_3) {
			$("#slider-range-3").slider({
				range: true,
				min: 0,
				max: 100000,
				values: [50000, 100000],
				slide: function(event, ui) {
					$("#amount-3").val("$" + ui.values[0]);
				}
			});
			$("#amount-3").val("$" + $("#slider-range-3").slider("values", 0));
		}

		let rangeSlider_4 = document.querySelector("#slider-range-4");
		if (rangeSlider_4) {
			$("#slider-range-4").slider({
				range: true,
				min: 0,
				max: 100000,
				values: [50000, 100000],
				slide: function(event, ui) {
					$("#amount-4").val("$" + ui.values[0]);
				}
			});
			$("#amount-4").val("$" + $("#slider-range-4").slider("values", 0));
		}


		/* ==================================================
		    Date Picker Init
		================================================== */
		$('.date-picker-one').datepicker()

		/* ==================================================


		Nice Select Init
		===============================================*/
		$('.quote-style-one select').niceSelect();
		$('.quote-style-two select').niceSelect();
		$('.quote-style-four select').niceSelect();
		$('.estimate-style-three-content select').niceSelect();


		/* ==================================================
		    GSAP animation
		================================================== */

		let animateUpDown = document.querySelector(".upDownScrol");
		if (animateUpDown) {

			gsap.set(".upDownScrol", {
				yPercent: 105
			});
			gsap.to(".upDownScrol", {
				yPercent: -105,
				ease: "none",
				scrollTrigger: {
					trigger: ".upDownScrol",
					end: "bottom center",
					scrub: 1
				},
			});
		}



		/* ==================================================
		    Splite Text
		================================================== */
		let text_split = document.querySelector(".split-text");
		if (text_split) {
			const animEls = document.querySelectorAll('.split-text');
			animEls.forEach(el => {
				var splitEl = new SplitText(el, {
					type: "lines, words",
					linesClass: "line"
				});
				var splitTl = gsap.timeline({
					duration: .15,
					ease: 'power4',
					scrollTrigger: {
						trigger: el,
						start: 'top 90%'
					}
				});

				splitTl.from(splitEl.words, {
					yPercent: "100",
					stagger: 0.025,
				});

			});
		}


		/* ==================================================
		    Contact Form Validations
		================================================== */
		$('.contact-form').each(function() {
			var formInstance = $(this);
			formInstance.submit(function() {

				var action = $(this).attr('action');

				$("#message").slideUp(750, function() {
					$('#message').hide();

					$('#submit')
						.after('<img src="assets/img/ajax-loader.gif" class="loader" />')
						.attr('disabled', 'disabled');

					$.post(action, {
							name: $('#name').val(),
							email: $('#email').val(),
							phone: $('#phone').val(),
							comments: $('#comments').val()
						},
						function(data) {
							document.getElementById('message').innerHTML = data;
							$('#message').slideDown('slow');
							$('.contact-form img.loader').fadeOut('slow', function() {
								$(this).remove()
							});
							$('#submit').removeAttr('disabled');
						}
					);
				});
				return false;
			});
		});

	}); // end document ready function


	/* ==================================================
        Preloader Init
     ===============================================*/
	$(window).on('load', function(event) {
		$('#preloader').delay(500).fadeOut(500);
	});



})(jQuery); // End jQuery