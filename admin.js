/* ============================================
   ALGOVERSE — Admin Panel JavaScript
   ============================================ */
(function () {
    'use strict';

    const userData = JSON.parse(localStorage.getItem('algoverse_user') || '{}');
    const adminName = document.getElementById('adminName');
    if (adminName) adminName.textContent = userData.name || 'Admin';

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const topbarMenu = document.getElementById('topbarMenu');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    if (topbarMenu) topbarMenu.addEventListener('click', () => sidebar.classList.toggle('open'));

    // Page Nav
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.sidebar-link[data-page]');
    const topbarTitle = document.getElementById('topbarTitle');
    const pageTitles = { analytics: 'Analytics Dashboard', users: 'User Management', content: 'DSA Content Management', quizzes: 'Quiz & Problem Management', settings: 'Platform Settings' };

    function showPage(id) {
        pages.forEach(p => p.classList.remove('active'));
        links.forEach(l => l.classList.remove('active'));
        const page = document.getElementById('page' + id.charAt(0).toUpperCase() + id.slice(1));
        if (page) page.classList.add('active');
        links.forEach(l => { if (l.dataset.page === id) l.classList.add('active'); });
        if (topbarTitle) topbarTitle.textContent = pageTitles[id] || 'Admin';
        if (window.innerWidth < 768) sidebar.classList.remove('open');
    }

    links.forEach(l => l.addEventListener('click', (e) => { e.preventDefault(); showPage(l.dataset.page); }));

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { localStorage.removeItem('algoverse_user'); window.location.href = 'index.html'; });

    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', () => {
            const q = userSearch.value.toLowerCase();
            document.querySelectorAll('#usersTable tbody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(q) ? '' : 'none';
            });
        });
    }

    // Role filter
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', () => {
            const val = roleFilter.value;
            document.querySelectorAll('#usersTable tbody tr').forEach(row => {
                const role = row.querySelector('.role-badge');
                if (!role) return;
                const isMatch = val === 'all' || role.classList.contains(val);
                row.style.display = isMatch ? '' : 'none';
            });
        });
    }

    // Delete buttons
    document.querySelectorAll('.act-btn.del').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                const row = btn.closest('tr') || btn.closest('.content-card');
                if (row) { row.style.opacity = '0'; row.style.transform = 'scale(0.95)'; row.style.transition = 'all 0.3s ease'; setTimeout(() => row.remove(), 300); }
            }
        });
    });

    // Save buttons
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', () => {
            const origText = btn.textContent;
            btn.textContent = '✓ Saved!';
            btn.style.background = 'rgba(34,197,94,0.2)';
            btn.style.color = '#22c55e';
            setTimeout(() => { btn.textContent = origText; btn.style.background = ''; btn.style.color = ''; }, 2000);
        });
    });

    // Add buttons (demo modals)
    ['addUserBtn', 'addContentBtn', 'addQuizBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                alert('This would open a creation form in a full implementation. Demo mode active.');
            });
        }
    });

})();
