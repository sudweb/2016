$(function () {

  // Toggle state trigger
  $("[class*='trigger']").click(function (event) {
    event.preventDefault()
    var trigger = $(this),
      target = '#' + trigger.data('target')
    trigger.add(target).toggleClass('active')
  })

  // Extract from jQuery Easing v1.3
  jQuery.extend(jQuery.easing, {
    easeInOutQuint: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
    }
  })

  // Bulletproof ease scrolling function
  $("a[href^='#']").click(function (e) {
    e.preventDefault()
    var anchor = this.hash
    if (anchor === '') { return false; }
    // Add exceptions here
    $('html,body').stop().animate({'scrollTop': Math.ceil($(anchor).offset().top)}, 1000, 'easeInOutQuint', function () {
      anchor == '#top' ? window.location.hash = '' : window.location.hash = anchor;})
  })
})
