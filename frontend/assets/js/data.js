const fs = require('fs');
const pathModule = require('path');

// Define o caminho de forma correta e portátil
const path = pathModule.join(
    process.env.HOME || process.env.USERPROFILE,
    'Documents',
    'Tasker',
    'data.json'
);




document.addEventListener('DOMContentLoaded', function () {
    if (!fs.existsSync(path)) {
        initializeData();
    }

    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            console.log('Envio de formulário prevenido!');
        });
    });

    updatePageValues();
    populateCategories();
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const categoria = searchParams.get("categoria");

    if (categoria) {
        exibirTarefasPorCategoria(categoria);
    } else {
        console.error('Parâmetro de categoria não encontrado.');
    }

    const tarefa = document.getElementById('criar-tarefa');
    if (tarefa) {
        tarefa.addEventListener('click', () => {
            const url = new URL(window.location.href);
            const searchParams = url.searchParams;
            const categoria = searchParams.get("categoria");

            let task = document.getElementById('task').value;
            let coin = document.getElementById('coin').value;
            let resultado = addCategoryOrTask(categoria, task, { coins: coin });
            if (resultado) {
                window.location.href = `tarefas.html?categoria=${categoria}`
            }
        })
    }

    const divCategoria = document.getElementById('criar-categoria');
    if (divCategoria) {
        divCategoria.addEventListener('click', () => {
            let nomeCategoria = document.getElementById('category').value;
            let resultado = addCategoryOrTask(nomeCategoria);
            if (resultado) {
                window.location.href = `categorias.html`
            }
        })
    }

    const minhasMoedas = document.getElementById('converter');
    if (minhasMoedas) {
        minhasMoedas.addEventListener('click', () => {
            let moedas = document.getElementById('mycoins').value;
            moedas = parseFloat(moedas);
            let dinheiro = moedas / 100;
            const data = readData();
            const coins = data.coins;
            const dinheiroAntigo = data.dinheiro;
            const totalMoedas = coins - moedas;
            const totalDinheiro = dinheiroAntigo + dinheiro;
            let resultado = updateValue('dinheiro', totalDinheiro)
            if (resultado) {
                console.log(totalMoedas);
                resultado = updateValue('coins', totalMoedas);
                if (resultado) {
                    window.location.href = `index.html`
                }
            }
        })
    }

    const divDinheiro = document.getElementById('retirar');
    if (divDinheiro) {
        divDinheiro.addEventListener('click', () => {
            let dinheiro = document.getElementById('money').value;
            dinheiro = virgulaParaPonto(dinheiro);
            const data = readData();
            const dinheiroAntigo = data.dinheiro;
            const totalDinheiro = dinheiroAntigo - dinheiro;
            let resultado = updateValue('dinheiro', totalDinheiro)
            if (resultado) {
                window.location.href = `index.html`
            }
        })
    }


    document.querySelectorAll('.concluir').forEach(element => {
        element.addEventListener('click', () => {
            const url = new URL(window.location.href);
            const searchParams = url.searchParams;
            const categoria = searchParams.get("categoria");
            const target = element.getAttribute('data-value');
            const dados = stringToObject(target);
            const data = readData();
            const coins = data.coins;
            let totalMoedas = coins + dados.coins
            let resultado = updateValue('coins', totalMoedas);
            if (resultado) {
                resultado = deleteCategoryOrTask(categoria, dados.task);
                if (resultado) {
                    window.location.reload();
                }
            }
        });
    });
});

function pontoParaVirgula(texto) {
    return texto.replace(/\./g, ',');
}

function virgulaParaPonto(texto) {
    return texto.replace(/,/g, '.');
}

function stringToObject(input) {
    try {
        // Remove colchetes e divide a string em dois elementos
        const values = input.replace(/\[|\]/g, '').split(',');
        if (values.length !== 2) throw new Error('Formato inválido');

        const task = values[0].trim().replace(/['"]+/g, '');
        const coinsRaw = values[1].trim();

        const coins = /^[0-9]+$/.test(coinsRaw) ? parseInt(coinsRaw, 10) : coinsRaw.replace(/['"]+/g, '');
        const taskFormatted = /^[0-9]+$/.test(task) ? parseInt(task, 10) : task;

        return {
            task: taskFormatted,
            coins: coins
        };
    } catch (error) {
        console.error('Erro ao converter string para objeto:', error.message);
        return null;
    }
}

// Função para inicializar o arquivo com dados padrão
function initializeData() {
    const initialData = {
        coins: 0,
        dinheiro: 0.0,
        categorias: {},
    };

    // Cria os diretórios caso não existam
    fs.mkdirSync(pathModule.dirname(path), { recursive: true });

    fs.writeFileSync(path, JSON.stringify(initialData, null, 2));
    console.log('Arquivo inicializado com dados padrão.');
}

// Função para ler os dados do arquivo
function readData() {
    if (!fs.existsSync(path)) {
        console.error('Arquivo não encontrado. Inicialize-o primeiro.');
        return null;
    }

    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
}

// Função para salvar dados no arquivo
function saveData(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log('Dados salvos com sucesso.');
}

// Função para adicionar moedas ou dinheiro
function updateValue(key, value) {
    const data = readData();
    if (!data) return;

    data[key] = value;
    saveData(data);
    console.log(`Valor atualizado: ${key} = ${value}`);
    return true;
}

// Função para adicionar uma categoria ou tarefa
function addCategoryOrTask(category, task, taskData = {}) {
    const data = readData();
    if (!data) return;

    if (!data.categorias[category]) {
        data.categorias[category] = {};
        console.log(`Categoria '${category}' criada.`);
    }

    if (task) {
        data.categorias[category][task] = taskData;
        console.log(`Tarefa '${task}' adicionada à categoria '${category}'.`);
    }

    saveData(data);

    return true;
}

// Função para excluir uma categoria ou tarefa
function deleteCategoryOrTask(category, task = null) {
    const data = readData();
    if (!data) return;

    if (!data.categorias[category]) {
        console.error(`Categoria '${category}' não encontrada.`);
        return;
    }

    if (task) {
        delete data.categorias[category][task];
        console.log(`Tarefa '${task}' removida da categoria '${category}'.`);
    } else {
        delete data.categorias[category];
        console.log(`Categoria '${category}' removida.`);
    }

    saveData(data);
    return true;
}

function updatePageValues() {
    const data = readData();
    if (!data) return;

    // Atualiza o valor de coins
    const coinsDiv = document.getElementById('coins');
    if (coinsDiv) {
        coinsDiv.textContent = data.coins;
    }

    // Atualiza o valor de dinheiro com formatação brasileira
    const dinheiroDiv = document.querySelector('.dinheiro-div');
    if (dinheiroDiv) {
        dinheiroDiv.textContent = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(data.dinheiro);
    }
}

function populateCategories() {
    const data = readData();
    if (!data || !data.categorias) return;

    // Limpa as categorias existentes
    const categoriasContainer = document.querySelector('.principal.categorias');
    if (!categoriasContainer) return;
    categoriasContainer.innerHTML = '';

    // Cria uma div para cada categoria no modelo fornecido
    Object.keys(data.categorias).forEach((categoria) => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'botao-princ redire';
        categoriaDiv.setAttribute('value', `tarefas.html?categoria=${encodeURIComponent(categoria)}`);

        const innerDiv = document.createElement('div');
        innerDiv.className = 'naoSelecionavel';
        innerDiv.textContent = categoria;

        categoriaDiv.appendChild(innerDiv);
        categoriasContainer.appendChild(categoriaDiv);
    });

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
}

function exibirTarefasPorCategoria(categoria) {
    const data = readData(); // Usa a função readData() definida em data.js
    if (!data || !data.categorias || !data.categorias[categoria]) {
        console.error(`Categoria '${categoria}' não encontrada.`);
        return;
    }

    const tarefas = data.categorias[categoria];
    const containerTarefas = document.querySelector('.principal.tarefas');

    // Limpa as tarefas existentes antes de adicionar novas
    if (containerTarefas) {
        containerTarefas.innerHTML = ''; Object.entries(tarefas).forEach(([nomeTarefa, detalhes]) => {
            const tarefaDiv = document.createElement('div');
            tarefaDiv.className = 'botao-princ';

            const dentroBotaoDiv = document.createElement('div');
            dentroBotaoDiv.className = 'dentroBotao';

            const conjuntoBotaoDiv = document.createElement('div');
            conjuntoBotaoDiv.className = 'conjunto-botao';

            const textoTarefaDiv = document.createElement('div');
            textoTarefaDiv.className = 'texto-tarefa';
            textoTarefaDiv.textContent = nomeTarefa;

            const coinTarefaDiv = document.createElement('div');
            coinTarefaDiv.className = 'coin-tarefa naoSelecionavel';

            const valorCoinDiv = document.createElement('div');
            valorCoinDiv.textContent = detalhes.coins;

            const moedaImg = document.createElement('img');
            moedaImg.src = '../assets/img/moeda.png';
            moedaImg.draggable = false;

            coinTarefaDiv.appendChild(valorCoinDiv);
            coinTarefaDiv.appendChild(moedaImg);

            conjuntoBotaoDiv.appendChild(textoTarefaDiv);
            conjuntoBotaoDiv.appendChild(coinTarefaDiv);

            const concluirDiv = document.createElement('div');
            concluirDiv.className = `concluir`;
            concluirDiv.setAttribute('data-value', `['${nomeTarefa}',${detalhes.coins}]`);
            concluirDiv.textContent = '✓';

            dentroBotaoDiv.appendChild(conjuntoBotaoDiv);
            dentroBotaoDiv.appendChild(concluirDiv);

            tarefaDiv.appendChild(dentroBotaoDiv);
            containerTarefas.appendChild(tarefaDiv);
        });
    }



}


// Atualizar moedas e dinheiro
// updateValue('coins', 1200);
// updateValue('dinheiro', 15.0);

// Adicionar nova categoria e tarefas
//  addCategoryOrTask('categoria1', 'tarefa1', { coins: 400 });
//  addCategoryOrTask('categoria1', 'tarefa2', { coins: 400 });
//  addCategoryOrTask('categoria2', 'tarefa1', { coins: 400 });
//  addCategoryOrTask('categoria2', 'tarefa2', { coins: 500 });

// Ler e exibir os dados
// console.log('Dados Atuais:', readData());

// Excluir uma tarefa e uma categoria
// deleteCategoryOrTask('categoria2', 'tarefa1');
// deleteCategoryOrTask('categoria1');

// Ler e exibir os dados atualizados
// console.log('Dados Atualizados:', readData());
