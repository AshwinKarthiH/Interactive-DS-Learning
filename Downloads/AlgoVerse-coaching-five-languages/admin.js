/* ============================================
   ALGOVERSE — Admin Panel JavaScript
   ============================================ */
(function () {
    'use strict';
    if(globalThis.AlgoAPI?.enabled)return;

    const userData = AlgoStore.read('algoverse_user', {});
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


    // Administrative data is sample data, saved in this browser only.
    const removed = AlgoStore.read('algoverse_admin_removed', []);
    const settings = AlgoStore.read('algoverse_admin_settings', {});
    document.querySelectorAll('#usersTable tbody tr, .content-card, #pageQuizzes tbody tr').forEach((item,i) => {
        item.dataset.localId = String(i);
        if (removed.includes(String(i))) item.remove();
    });
    function filterUsers() {
        const query = document.getElementById('userSearch').value.toLowerCase();
        const role = document.getElementById('roleFilter').value;
        const status = document.getElementById('statusFilter').value;
        document.querySelectorAll('#usersTable tbody tr').forEach(row => {
            row.hidden = !(row.textContent.toLowerCase().includes(query) &&
                (role === 'all' || row.querySelector('.role-badge')?.classList.contains(role)) &&
                (status === 'all' || row.querySelector('.status-dot')?.classList.contains(status)));
        });
    }
    ['userSearch','roleFilter','statusFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='userSearch'?'input':'change',filterUsers));
    document.querySelectorAll('.act-btn.del').forEach(btn=>btn.addEventListener('click',()=>{
        if (!confirm('Delete this sample item from this browser?')) return;
        const item=btn.closest('tr') || btn.closest('.content-card');
        if (!item) return;
        const next=[...removed,item.dataset.localId];
        if (AlgoStore.write('algoverse_admin_removed',next)) {removed.push(item.dataset.localId);item.remove();}
    }));
    document.querySelectorAll('.settings-card').forEach((card,i)=>{
        const fields=[...card.querySelectorAll('input,textarea')];
        fields.forEach((field,j)=>{
            const saved=settings[i]?.[j];
            if(saved!==undefined) {if(field.type==='checkbox')field.checked=saved===true;else field.value=saved;}
        });
        const btn=card.querySelector('.btn-save');
        if (!btn) return;
        if(i===2 || !fields.length) {btn.disabled=true;btn.textContent='Requires backend — unavailable';fields.forEach(f=>f.disabled=true);return;}
        btn.textContent='Save browser-local settings';
        btn.addEventListener('click',()=>{
            settings[i]=fields.map(f=>f.type==='checkbox'?f.checked:f.value);
            if(AlgoStore.write('algoverse_admin_settings',settings)) {btn.textContent='Saved in this browser';setTimeout(()=>btn.textContent='Save browser-local settings',1500);}
        });
    });
    document.querySelectorAll('.act-btn:not(.del), .btn-add').forEach(btn=>{
        btn.disabled=true; btn.title='Not implemented in this local demo';
        if(btn.classList.contains('btn-add'))btn.textContent+=' — unavailable';
    });
})();
