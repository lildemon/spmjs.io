// JavaScript Document

$.fn.navAnim = function(opt) {
	var options = $.extend({
		iconClass: '.m_icon',
		textClass: '.m_txt',
		iconAnimTo: '10px',
		textAnimTo: '70px'
	}, opt)

	return this.each(function(idx, el) {
		var $this = $(this)
		var $icon = $this.find(options.iconClass)
		var $text = $this.find(options.textClass)
		var iconAnimFrom, textAnimFrom
		if($icon.length && $text.length) {
			iconAnimFrom = $icon.css('top')
			textAnimFrom = $text.css('top')
			$(this).on('mouseenter mouseleave', function(e) {
				var isEntry = e.type == 'mouseenter'
				$icon.animate({
					top: isEntry ? options.iconAnimTo : iconAnimFrom
				}, {
					queue: false,
					duration: 250
				})
				$text.animate({
					top: isEntry ? options.textAnimTo : textAnimFrom
				}, {
					queue: false,
					duration: 300
				})

			})
		}
	})
}
