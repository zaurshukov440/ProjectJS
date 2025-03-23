document.getElementById('lookup-btn').addEventListener('click', function() {
    const domainInput = document.getElementById('domain-input').value;
    const resultContainer = document.getElementById('result');
    
    resultContainer.innerHTML = '';

    if (domainInput.trim() === "") {
        resultContainer.innerHTML = '<p class="container__error">Пожалуйста, введите домен.</p>';
        return;
    }

    const apiUrl = `https://api.apiverve.com/v1/dnslookup?domain=${domainInput}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'x-api-key': '8a2e7758-b599-46ad-b86c-76dd4fff167e', 
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            const records = data.data.records;
            const domain = data.data.domain;
            
            resultContainer.innerHTML = `
                <h2>Результаты для: ${domain}</h2>
                <p><strong>A записи:</strong></p>
                <ul>
                    ${records.A ? records.A.map(ip => `<li>${ip}</li>`).join('') : '<li>Нет данных</li>'}
                </ul>
                <p><strong>NS записи:</strong></p>
                <ul>
                    ${records.NS ? records.NS.map(ns => `<li>${ns}</li>`).join('') : '<li>Нет данных</li>'}
                </ul>
                <p><strong>MX записи:</strong></p>
                <ul>
                    ${records.MX ? records.MX.map(mx => `<li>${mx.exchange} (Приоритет: ${mx.priority})</li>`).join('') : '<li>Нет данных</li>'}
                </ul>
                <p><strong>TXT записи:</strong></p>
                <ul>
                    ${records.TXT ? records.TXT.map(txt => `<li>${txt.join(', ')}</li>`).join('') : '<li>Нет данных</li>'}
                </ul>
            `;
        } else {
            resultContainer.innerHTML = '<p class="container__error">Не удалось получить данные для указанного домена.</p>';
        }
    })
    .catch(error => {
        resultContainer.innerHTML = '<p class="container__error">Произошла ошибка при запросе к API.</p>';
    });
});
