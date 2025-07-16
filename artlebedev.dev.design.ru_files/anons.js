var anonsPage = {
	init: function () {
		this.seeAlsov2Init();
		this.statInit();
		this.creditsInit();
		//this.buttonsInit();
		this.fixedButtonInit();
	},
	seeAlsov2Init: function () {
		var $also = $('#portfolio-see-also');
		if (!$also.length || !$also.is(':visible')) return false;
		var $alsoWrapper = $('.portfolio-see-also-wrapper', $also);
		var oldOpa = 1,
			startScale = 0.9;
		$(document).on('scroll.portfolioSeeAlso', function () {
			var top = $(document).scrollTop();
			var wh = $(window).height(),
				start = $also.offset().top - wh,
				alsoHeight = $also.height(),
				end = alsoHeight + start,
				opa, p;
			if (alsoHeight > wh) end = start + wh - wh / 4;
			if (top < start) {
				opa = 1
			} else {
				p = (top - start) * 100 / (end - start);
				opa = (100 - p) / 100;
				if (opa < 0) opa = 0;
				if (opa > 1) opa = 1;
			}
			if (opa != oldOpa) {
				oldOpa = opa;
				p = (100 - 100 * opa) / 100;
				var scale = (1 - startScale) * p + startScale;
				if (scale > 1) scale = 1;
				var aOpa = Math.abs(opa - 1);
				$alsoWrapper.css({
					'opacity': aOpa,
					'-webkit-transform': 'scale(' + scale + ')',
					'transform': 'scale(' + scale + ')'
				});
			}
		});
	},
	initPortfolio: function ($also) {
		if (!$also.length) return false;
		ALSPortfolio.init();
		var $tags = $('.portfolio-see-also-tags', $also),
			$container = $('.portfolio-global-container', $also);
		$('a', $tags).click(function (e) {
			if (window.alsYaUtils) alsYaUtils.goal('click_see_also_tag');
			if (alsKeyHandler.checkMetaKey(e)) return true;
			if ($(this).hasClass('selected')) return false;
			ALSPortfolio.loadCategory($container, $(this).attr('href'), true);
			$('a.selected', $tags).removeClass('selected');
			$(this).addClass('selected');
			return false;
		});
	},
	url: '/svalka/api/anons',
	statInit: function () {
		var self = this;
		$.getJSON(this.url + '/?action=stat&ref=' + encodeURIComponent(document.referrer.toString()) + '&' + new Date().getTime(), function (res) {
			if (res.isStudio && res.lang == 1) self.tagsInit();
		});

		var $button = $('#als-s-buttons [data-work-stat-id]');
		if (!$button.length) return false;

		function openPopup($popup) {
			var w = $(window).width();
			$('body').addClass('work-stat-graph-show');
			$popup.addClass('opened');
			var ww = $(window).width();
			$('body').css('padding-right', (ww - w) + 'px');

			$(document).bind('keydown.closeGraphStat', function (e) {
				if (e.keyCode == 27) self.closeStatPopup();
			});
		}
		
		var self = this;
		$button.click(function () {
			var $popup = $('#work-stat-graph');
			if (!$popup.length) {
				$popup = $('<div />').attr('id', 'work-stat-graph').addClass('work-stat-graph').appendTo('body');
				self.statGraphInit($popup);
				window.setTimeout(function () {
					openPopup($popup);
				}, 10);
			} else {
				openPopup($popup);
			}
		});
	},
	closeStatPopup: function () {
		var $popup = $('#work-stat-graph');
		$popup.removeClass('opened');
		$('body').removeClass('work-stat-graph-show').css('padding-right', 0);
		$(document).unbind('keydown.closeGraphStat');
	},
	statGraphInit: function ($popup) {
		var self = this;
		$popup.load(this.url + '/stat/', function () {
			$('.close', $popup).click(function () {
				self.closeStatPopup();
			});
		});
	},
	creditsInit: function () {
		var $container = $('#anons-credits');
		if (!$container.length) return false;
		$container.load(this.url + '/?action=anons_credits');
	},
	tagsInit: function (add_tag, remove_tag) {
		var self = this;
		add_tag = add_tag || 0;
		remove_tag = remove_tag || 0;
		$.getScript('https://img.artlebedev.ru/svalka/chosen/chosen.jquery.min.js', function () {
			window.setTimeout(function () {
				$('#s-add-tags').removeClass('working');
				$('#s-add-tags').load(self.url + '/?action=studio_tags&add_tag=' + add_tag + '&remove_tag=' + remove_tag, function () {
					$('#a-add-tag-select').chosen().change(function () {
						var tag_id = $(this).val()[0];
						self.tagsInit(tag_id);
						$('#s-add-tags').addClass('working');
						$('#s-add-tags .chosen-container input').remove();
					});
					$('#s-add-tags [data-del-id]').click(function () {
						self.tagsInit(0, $(this).data('del-id'));
						return false;
					});
				});
			}, 100);
		});
	},
	fixedButtonInit: function () {
		var $button = $('.announce-magazinus-button-fixed');
		if (!$button.length) return;
		var $credits = $('.credits');
		if (!$credits.length) return;
		var visible = true;
		$(document).on('scroll.fixButton', function () {
			var top = $(document).scrollTop(),
				point = $credits.offset().top - 20 - $(window).height();
			if (top >= point && visible) {
				$button.addClass('hide');
				visible = false;
			}
			if (top < point && !visible) {
				$button.removeClass('hide');
				visible = true;
			}
		});
	}
};
$(document).ready(function () {
	anonsPage.init();

	var videos = document.getElementsByClassName('video-autoplay');
	for(var i = 0; i < videos.length; i++) {
		new AlsVideoAutoplay(videos[i]);
	}

});


var AlsInViewport = function (elements, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	options = options || {};
	callback = callback || function() {};
	var setting = {
		windowTolerance: 0,
		tolerance: 0.7
	};
	var keys = Object.keys(options);
	if (keys.indexOf('tolerance') > -1) setting.tolerance = options.tolerance;
	if (keys.indexOf('windowTolerance') > -1) setting.windowTolerance = options.windowTolerance;
	this.options = setting;
	if (!elements || elements.length === 0) return;
	if (!elements.length) elements = [elements];
	for(var i = 0; i < elements.length; i++) {
		new AlsInViewportElement(elements[i], this.options, callback);
	}
};

var AlsInViewportElement = function (element, options, callback) {
	this._inViewport = false;
	this.element = element;
	this.setting = options;
	this.callback = callback;
	this.init();
};
AlsInViewportElement.prototype.init = function () {
	document.addEventListener('scroll', function () {
		this.onScroll();
	}.bind(this));
	this.onScroll();
};
AlsInViewportElement.prototype.onScroll = function () {
	if (this.isInViewport()) {
		if (!this._inViewport) {
			this._inViewport = true;
			this.callback('in', this.element);
		}
	} else {
		if (this._inViewport) {
			this._inViewport = false;
			this.callback('out', this.element);
		}
	}
};
AlsInViewportElement.prototype.isInViewport = function () {
	var setting = this.setting,
		rect = this.element.getBoundingClientRect(),
		o = {
			top: rect.top,
			bottom: rect.bottom,
			wh: (window.innerHeight || document.documentElement.clientHeight)
		};
	o.height = (o.bottom - o.top);

	var check = {
		from: o.wh,
		to: -o.height
	};
	if (setting.tolerance) {
		var c = setting.tolerance * o.height;
		if (c > o.wh - 1) c = o.wh - 1;
		check.from -= c;
		check.to += c;
	}
	if (setting.windowTolerance) {
		check.from += setting.windowTolerance * o.wh;
		check.to -= setting.windowTolerance * o.wh;
	}
	return o.top <= check.from && o.top >= check.to;
};


var AlsVideoAutoplay = function (video) {
	this.video = video;
	var finish = false,
		isLoop = this.video.hasAttribute('loop');
	if (video.webkitPlaysInline !== undefined) {
		video.webkitPlaysInline = true;
	}
	if (video.playsInline !== undefined) {
		video.playsInline = true;
	}

	if (!isLoop) {
		video.addEventListener('ended', function () {
			finish = true;
		});
	}

	new AlsInViewport(video, function (type) {
		if (!finish) {
			if (type == 'in') {
				video.play();
			} else {
				video.pause();
			}
		}
	})
};