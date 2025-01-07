document.querySelectorAll('.redire').forEach(element => {
    element.addEventListener('click', () => {
        const target = element.getAttribute('value');

        if (target) {
            window.location.href = target;
        } else {
            console.error('Atributo "value" não definido no elemento.');
        }
    });
});
