// Minimal reusable helpers for modals and tabs (exposed as window.Components)
(function () {
  function Modal(selector) {
    this.el = document.querySelector(selector);
  }
  Modal.prototype.open = function () { if (this.el) this.el.classList.add('active'); };
  Modal.prototype.close = function () { if (this.el) this.el.classList.remove('active'); };

  function TabController(rootSelector) {
    this.root = document.querySelector(rootSelector);
    if (!this.root) return;
    this.root.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = btn.dataset.tab;
        this.root.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.root.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const content = document.getElementById(`${name}-tab`);
        if (content) content.classList.add('active');
      });
    });
  }

  window.Components = { Modal, TabController };
})();
