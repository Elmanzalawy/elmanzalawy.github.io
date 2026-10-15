
(function () {
	var $ = function (s) { return document.querySelector(s) }, cards = [].slice.call(document.querySelectorAll('.card')),
		q = $('#q'), fb = $('#filters'), active = null;
	document.getElementById('y').textContent = new Date().getFullYear();

	// Build tag filters from the cards' own tags (sorted by popularity)
	var tally = {};
	cards.forEach(function (c) {
		var t = [].map.call(c.querySelectorAll('.chips li'), function (l) { return l.textContent });
		c._tags = t; c._text = (c.querySelector('h3').textContent + ' ' + c.querySelector('p').textContent + ' ' + t.join(' ')).toLowerCase();
		t.forEach(function (x) { tally[x] = (tally[x] || 0) + 1 });
	});
	Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a] || a.localeCompare(b) }).forEach(function (t) {
		var b = document.createElement('button'); b.type = 'button'; b.className = 'tag'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
		b.onclick = function () { active = active === t ? null : t;[].forEach.call(fb.querySelectorAll('.tag:not(.more)'), function (x) { x.setAttribute('aria-pressed', String(x.textContent === active)) }); if (more) fold(more._open); apply() };
		fb.appendChild(b);
	});

	// Show only the most-used tags at first; the rest sit behind one toggle (no sideways scrolling)
	var LIMIT = 8, all = [].slice.call(fb.children), more = null;
	function fold(open) {
		all.forEach(function (b, i) { b.hidden = !open && i >= LIMIT && b.textContent !== active });
		more._open = open; more.setAttribute('aria-expanded', String(open));
		more.textContent = open ? 'Show fewer' : '+' + (all.length - LIMIT) + ' more';
	}
	if (all.length > LIMIT) {
		more = document.createElement('button'); more.type = 'button'; more.className = 'tag more';
		more.onclick = function () { fold(!more._open) }; fb.appendChild(more); fold(false);
	}
	// Card tags are clickable filters too
	cards.forEach(function (c) { c.querySelectorAll('.chips li').forEach(function (l) { l.style.cursor = 'pointer'; l.onclick = function () { [].find.call(fb.children, function (b) { return b.textContent === l.textContent }).click(); location.hash = 'projects' } }) });

	function apply() {
		var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean), n = 0;
		cards.forEach(function (c) {
			var ok = terms.every(function (t) { return c._text.indexOf(t) > -1 }) && (!active || c._tags.indexOf(active) > -1);
			c.hidden = !ok; if (ok) n++;
		});
		$('#count').textContent = n + (n === 1 ? ' project' : ' projects') + (active || q.value ? ' found' : '');
		$('#none').hidden = n > 0;
		if (window.umami && q.value.length > 2) { clearTimeout(apply.t); apply.t = setTimeout(function () { umami.track('project-search', { query: q.value.toLowerCase() }) }, 1200) }
	}
	q.addEventListener('input', apply); apply();

	// Screenshot viewer: images only load when opened
	var dlg = $('#dlg'), dg = $('#dg');
	document.addEventListener('click', function (e) {
		var b = e.target.closest('.shots'); if (!b) return;
		var c = b.closest('.card'); dg.innerHTML = '';
		c.dataset.imgs.split('|').forEach(function (p) { var i = new Image(); i.src = 'images/fulls/' + p; i.loading = 'lazy'; i.alt = c.querySelector('h3').textContent + ' screenshot'; dg.appendChild(i) });
		$('#dt').textContent = c.querySelector('h3').textContent; dlg.showModal();
		if (window.umami) umami.track('screenshots-open', { project: c.querySelector('h3').textContent });
	});
	$('#dx').onclick = function () { dlg.close() };
	dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close() });

	// Copy email
	$('#copy').onclick = function () {
		var b = this, l = b.querySelector('span'), m = 'mohamed.elmanzalawy98@gmail.com';
		(navigator.clipboard ? navigator.clipboard.writeText(m) : Promise.reject()).then(function () { l.textContent = 'Copied!' }, function () { location.href = 'mailto:' + m }).then(function () { setTimeout(function () { l.textContent = 'Copy email address' }, 2000) });
	};

	// Sticky contact bar: appears after the hero, hides when the contact section is visible
	var bar = $('#bar'), past = false, atContact = false;
	function sync() { bar.classList.toggle('off', !past || atContact) }
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (e) { past = !e[0].isIntersecting; sync() }).observe($('#top'));
		new IntersectionObserver(function (e) { atContact = e[0].isIntersecting; sync() }).observe($('#contact'));
	} else bar.classList.remove('off');
})();