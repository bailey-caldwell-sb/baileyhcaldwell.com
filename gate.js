(() => {
    const form = document.getElementById('gateForm');
    const input = document.getElementById('accessCode');
    const error = document.getElementById('gateError');
    const { storageKey, target, codes, resetOnLoad } = form.dataset;
    const validCodes = codes.split(',');

    if (resetOnLoad !== undefined) sessionStorage.removeItem(storageKey);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (validCodes.includes(input.value.trim().toLowerCase())) {
            sessionStorage.setItem(storageKey, 'granted');
            window.location.href = target;
            return;
        }
        error.classList.add('is-visible');
        input.value = '';
        input.focus();
    });
})();
