// 1. VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
const formulario = document.querySelector("#formulario");
const tarefasSalvas = localStorage.getItem('minhasTarefas');

let tarefas = []; 
let idTarefaEmEdicao = null; // Variável para controlar se estamos criando ou editando

// Carregando dados do Local Storage ao abrir a página
if (tarefasSalvas !== null) {
    tarefas = JSON.parse(tarefasSalvas);
} else {
    tarefas = [];
}

// 2. FUNÇÃO DE RENDERIZAR (Ler / Desenhar na tela)
function renderizarTarefas(listaParaDesenhar = tarefas) {
    const listaHtml = document.querySelector("#ulTarefas");
    listaHtml.innerHTML = ""; // Limpa a lista antes de desenhar novamente

    listaParaDesenhar.forEach(function(tarefa) {
        // --- CRIANDO O CARD PRINCIPAL ---
        const li = document.createElement('li');
        li.classList.add('tarefa-card');
        
        // Cores de prioridade
        if (tarefa.prioridade === "Alta") {
            li.classList.add("prioridade-alta");
        } else if (tarefa.prioridade === "Média") {
            li.classList.add("prioridade-media");
        } else {
            li.classList.add("prioridade-baixa");
        }

        // --- DIV DE INFORMAÇÕES ---
        const divInfo = document.createElement('div');
        divInfo.classList.add('tarefa-info');

        const h3 = document.createElement('h3');
        h3.textContent = `#${tarefa.id} - ${tarefa.titulo}`;

        const pDescricao = document.createElement('p');
        pDescricao.classList.add('descricao');
        pDescricao.textContent = tarefa.descricao;

        const divMeta = document.createElement('div');
        divMeta.classList.add('meta-dados');

        const spanPrioridade = document.createElement('span');
        spanPrioridade.classList.add('tag-prioridade');
        spanPrioridade.textContent = tarefa.prioridade;

        const spanData = document.createElement('span');
        spanData.classList.add('data-entrega');
        spanData.textContent = `Entrega: ${tarefa.data}`;

        divMeta.appendChild(spanPrioridade);
        divMeta.appendChild(spanData);

        divInfo.appendChild(h3);
        divInfo.appendChild(pDescricao);
        divInfo.appendChild(divMeta);

        // --- DIV DE BOTÕES (AÇÕES) ---
        const divAcoes = document.createElement('div');
        divAcoes.classList.add('tarefa-acoes');

        // Botão Concluir
        const btnConcluir = document.createElement('button');
        btnConcluir.classList.add('btn-concluir');
        btnConcluir.textContent = 'Concluir';
        
        // Verificação visual se a tarefa já está concluída
        if (tarefa.concluida) {
            li.classList.add('tarefa-concluida');
            btnConcluir.textContent = 'Desfazer';
        }
        
        btnConcluir.addEventListener('click', function() {
            tarefa.concluida = !tarefa.concluida; // Inverte o status
            salvarNoLocalStorage();
            renderizarTarefas();
        });

        // Botão Editar
        const btnEditar = document.createElement('button');
        btnEditar.classList.add('btn-editar');
        btnEditar.textContent = 'Editar';
        
        btnEditar.addEventListener('click', function() {
            // Entrando no Modo Edição
            idTarefaEmEdicao = tarefa.id;

            // Preenchendo os inputs com os dados atuais da tarefa
            document.querySelector("#tituloTarefa").value = tarefa.titulo;
            document.querySelector("#descricaoTarefa").value = tarefa.descricao;
            document.querySelector("#prioridadeTarefa").value = tarefa.prioridade;
            document.querySelector("#dataTarefa").value = tarefa.data;

            // Mudando o texto do botão do formulário
            const botaoForm = document.querySelector('button[type="submit"]');
            botaoForm.textContent = 'Salvar Alterações';
        });

        // Botão Remover
        const btnRemover = document.createElement('button');
        btnRemover.classList.add('btn-remover');
        btnRemover.textContent = 'Remover';
        
        btnRemover.addEventListener('click', function() {
            // Filtra o array tirando a tarefa clicada
            tarefas = tarefas.filter(t => t.id !== tarefa.id);
            salvarNoLocalStorage();
            renderizarTarefas();
        });

        // Anexando os botões na div de ações
        divAcoes.appendChild(btnConcluir);
        divAcoes.appendChild(btnEditar);
        divAcoes.appendChild(btnRemover);

        // --- MONTANDO O CARD ---
        li.appendChild(divInfo);
        li.appendChild(divAcoes);

        listaHtml.appendChild(li);
    });
}

renderizarTarefas();

// 3. FUNÇÃO PRINCIPAL DO FORMULÁRIO (Criar e Atualizar)
function adicionarTarefa(e) {
    e.preventDefault(); // Trava o recarregamento da página

    // Capturando os valores
    const tituloValor = document.querySelector("#tituloTarefa").value;
    const descricaoValor = document.querySelector("#descricaoTarefa").value;
    const prioridadeValor = document.querySelector("#prioridadeTarefa").value;
    const dataValor = document.querySelector("#dataTarefa").value;

    // Validação
    if (tituloValor.trim() === '') {
        alert('Por favor digite um título para a tarefa!');
        return;
    }

    if (idTarefaEmEdicao === null) {
        // --- MODO CRIAÇÃO ---
        const novaTarefa = {
            id: Date.now(),
            titulo: tituloValor,
            descricao: descricaoValor,
            prioridade: prioridadeValor,
            data: dataValor,
            concluida: false
        };
        tarefas.push(novaTarefa);
        
    } else {
        // --- MODO EDIÇÃO ---
        // Atualiza apenas a tarefa que tem o ID correspondente
        tarefas = tarefas.map(function(t) {
            if (t.id === idTarefaEmEdicao) {
                return {
                    id: t.id, 
                    titulo: tituloValor,
                    descricao: descricaoValor,
                    prioridade: prioridadeValor,
                    data: dataValor,
                    concluida: t.concluida 
                };
            }
            return t;
        });

        // Limpa o estado de edição para voltar ao normal
        idTarefaEmEdicao = null;
        
        // Volta o botão para o texto original
        const botaoForm = document.querySelector('button[type="submit"]');
        botaoForm.textContent = 'Adicionar tarefa!';
    }

    // Salva, Renderiza e Limpa o formulário
    salvarNoLocalStorage();
    renderizarTarefas();
    formulario.reset();
}
// 4. FUNÇÃO DE SALVAR NO NAVEGADOR
function salvarNoLocalStorage() {
    const tarefasEmTexto = JSON.stringify(tarefas);
    localStorage.setItem('minhasTarefas', tarefasEmTexto);
}
// 5. EVENTOS GERAIS
formulario.addEventListener('submit', adicionarTarefa);
// 6. TOOLBAR: PESQUISA E FILTROS
// Filtro por pesquisa de Título
const inputPesquisa = document.querySelector('#pesquisarTarefa');

inputPesquisa.addEventListener('input', function(e) {
    const termoBusca = e.target.value.toLowerCase();
    const tarefasFiltradas = tarefas.filter(function(tarefa) {
        return tarefa.titulo.toLowerCase().includes(termoBusca);
    });
    renderizarTarefas(tarefasFiltradas);
});

//Filtro por Status (Concluída ou pendentes)
const selectFiltro = document.querySelector('#filtrarStatus');

selectFiltro.addEventListener('change', function(e) {
    const opcaoEscolhida = e.target.value;    
    let tarefasFiltradas = [];
    
    if (opcaoEscolhida === 'todas') {
        tarefasFiltradas = tarefas;       
    } else if (opcaoEscolhida === 'pendentes') {
        tarefasFiltradas = tarefas.filter(function(t) {
            return t.concluida === false;
        });      
    } else if (opcaoEscolhida === 'concluidas') {
        tarefasFiltradas = tarefas.filter(function(t) {
            return t.concluida === true;
        });
    }
    renderizarTarefas(tarefasFiltradas);
});

// Ordenar Tarefas (Data mais próxima / Data mais distante / por prioridade)
const selectOrdenar = document.querySelector('#ordenarTarefas');

selectOrdenar.addEventListener('change', function(e) {
    const opcao = e.target.value;
    let tarefasOrdenadas = [...tarefas];
    if (opcao === 'dataMaisProxima') {
        tarefasOrdenadas.sort(function(a, b) {
            return new Date(a.data) - new Date(b.data);
        });
    } else if (opcao === 'dataMaisDistante') {
        tarefasOrdenadas.sort(function(a, b) {
            return new Date(b.data) - new Date(a.data);
        });
    } else if (opcao === 'prioridadeAlta') {
        const pesos = { "Alta": 3, "Média": 2, "Baixa": 1 };        
        tarefasOrdenadas.sort(function(a, b) {
            return pesos[b.prioridade] - pesos[a.prioridade];
        });
    }
    renderizarTarefas(tarefasOrdenadas);
});