$(document).ready(function (){ // jQuery, carregamento completo do documento
    cardapio.eventos.init(); // chamando um objeto e sua função
})

var cardapio = {}; // criando uma variável
var meuCarrinho = [];
var meuEndereco = null; // ou seja, um valor sem linkagem(armazenamento) na memória, um valor solto

var valorCarrinho = 0;
var valorEntrega = 5;
var celularEmpresa = '5521995291891';

cardapio.eventos = { // criando um objeto

    init: () => { // criando uma método para inicialiar o documento Javascript 
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
        cardapio.metodos.carregarBotaoWhatsapp();
       
    }
}

cardapio.metodos = {
    
    obterItensCardapio: (categoria = 'burgers', vermais = false) => { // método que obtem a lista do cardápio

        // realizando um filtro no menu, selecionando o menu
        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html('') // limpa o cardápio do hmtl
            $("#btnVerMais").removeClass('hidden');
        }
       
       
        $.each(filtro, (i, e) => { // percorrendo a lista dos itens no MENU burgers(i = itens, e = elementos)

            // permite armazenar a listagem temporário e aplicando filtro
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img) // 'g', 'e.img' ou seja, substituir 'g' pelo nome 'e.img'
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id);

            
            // botão ver mias foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(temp) // adicionando template
            }

            // paginação inicial (8 itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp)
            }


            

        } ) 

        // remove o ativo
        $(".container-menu a").removeClass('active');

        // seta o menu para ativo
        $("#menu-" + categoria).addClass('active');


    },

    
    verMais: () => { // clique no botão de ver mais

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1]; // menu burgers
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass('hidden');

    },

    diminuirQuanitdade: (id) => { // diminui a quantidade de itens no cardápio

        // criando e armazenando a quantidade total de cada item
        let quantidadeAtual = parseInt($("#qntd-" + id).text()); 

        if (quantidadeAtual > 0) {
            $("#qntd-" + id).text(quantidadeAtual - 1)
        }

    },

    aumentarQuantidade: (id) => { // aumentar a quantidade de itens no cardápio

        let quantidadeAtual = parseInt($("#qntd-" + id).text()); 
        $("#qntd-" + id).text(quantidadeAtual + 1)
    }, 

    adicionarCarrinho: (id) => { // adicionar ao carrinho a quantidade do item do cardápio
        let quantidadeAtual = parseInt($("#qntd-" + id).text()); 
       
        if (quantidadeAtual > 0) {

            // obtendo a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1]; 

            // obtendo a lista do carrinho
            let filtro = MENU[categoria];

            // obtento o item
            let item = $.grep(filtro, (e, i) => {return e.id == id});

            if (item.length > 0) {

                // validar se existe um mesmo item no carrinho
               let existe = $.grep(meuCarrinho, (elem, index) => {return elem.id == id});

               if (existe.length > 0) { // caso já exista o item, altere apenas a quantidade
                    let objetoIndex = meuCarrinho.findIndex((obj => obj.id == id));
                    meuCarrinho[objetoIndex].qntd = meuCarrinho[objetoIndex].qntd + quantidadeAtual;
               } else { // senão, adicione ele
                    item[0].qntd = quantidadeAtual;
                    meuCarrinho.push(item[0])
               }

              cardapio.metodos.mensagemGlobal('Adicionado ao carrinho', 'green');
               $("#qntd-" + id).text(0);

               cardapio.metodos.atualizarBadgeTotal(); // adiciona aos botões os valores adicionados ao carrinho
            }
        }
    },

    atualizarBadgeTotal: () => { // atualiza o badge de totais dos botões do carrinho

        var total = 0;

        $.each(meuCarrinho, (i, e) => {
            total = total + e.qntd
       })

       if (total > 0) { // amostrar o botão com a quantidade
            $(".botao-carrinho").removeClass('hidden')
            $(".container-total-carrinho").removeClass('hidden')

            
       } else { // esconder o botão com a quantidade
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden')
       }

       $(".badge-total-carrinho").html(total);


    },
    
    // abrir a modal de carrinho
    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden'); // aparecer a modalCarrinho
            cardapio.metodos.carregarCarrinho(1);
        } else {
            $("#modalCarrinho").addClass('hidden'); // deixar de aparecer a modalCarrinho
        }
    },

    // Etapas do carrinhp 
    carregarEtapa: (etapa) => {

        if (etapa == 1) { // se Etapa1
            $("#lblTituloEtapa").text('Seu carrinho'); // adiciona um nome a etapa1
            $("#itensCarrinho").removeClass('hidden'); // aparecer o conteudo do itensCarrinho
            $("#localEntrega").addClass('hidden'); // deixar de aparecer o conteudo localEntrega
            $("#resumoCarrinho").addClass('hidden'); // deixar de aaparecer o conteudo do resumoCarrinho

            $(".etapa").removeClass('active'); // aparecer o conteúdo da etapa
            $(".etapa1").addClass('active'); // deixar de aparecer o conteúdo da etapa1
            
            $("#btnEtapaPedido").removeClass('hidden'); // aparecer o botão
            $("#btnEtapaEndereco").addClass('hidden'); // remover o conteudo da EtapaEndereço
            $("#btnEtapaResumo").addClass('hidden'); // deixar de aparecer o conteudo da EtapaResumo
            $("#btnEtapaVoltar").addClass('hidden'); // deixar de aparecer o conteúdo da EtapaVoltar

        } 
        
        if (etapa == 2) { // se Etapa2
            $("#lblTituloEtapa").text('Endereço de entrega'); // adiciona um nome a etapa2
            $("#itensCarrinho").addClass('hidden'); // deixar de aparecer o conteudo do itensCarrinho
            $("#localEntrega").removeClass('hidden'); //  aparecer o conteudo do localEntrega
            $("#resumoCarrinho").addClass('hidden'); // dexiar de aparecer o conteudo do resumoCarrinho

            $(".etapa").removeClass('active'); // aparecer o conteudo da etapa
            $(".etapa1").addClass('active'); // deixar de aparecer o conteudo da etapa1
            $(".etapa2").addClass('active'); // deixar de aparecer o conteudo da etapa2
            
            $("#btnEtapaPedido").addClass('hidden'); // deixar de aparecer o conteudo da EtapaPedido
            $("#btnEtapaEndereco").removeClass('hidden'); // aparecer o conteudo da EtapaEndereco
            $("#btnEtapaResumo").addClass('hidden'); // deixar de aparecer o conteudo da EtapaResumo
            $("#btnEtapaVoltar").removeClass('hidden'); // aparecer o conteudo da EtapaVoltar, ao clicar
        }

        if (etapa == 3) { // se Etapa3

            $("#lblTituloEtapa").text('Resumo do pedido'); // adiciona um nome a etapa3
            $("#itensCarrinho").addClass('hidden'); // deixar de aparecer o conteudo do itensCarrinho
            $("#localEntrega").addClass('hidden'); //  deixar de aparecer o conteudo do localEntrega
            $("#resumoCarrinho").removeClass('hidden'); // aparecer o conteudo do resumoCarrinho
            $("#text-entrega").removeClass('hidden');
            $("#text-total").removeClass('hidden');

            $(".etapa").removeClass('active'); // aparecer o conteudo da etapa
            $(".etapa1").addClass('active'); // deixar de aparecer o conteudo da etapa1
            $(".etapa2").addClass('active'); // deixar de aparecer o conteudo da etapa2
            $(".etapa3").addClass('active'); // deixar de aparecer o conteudo da etapa3
            
            $("#btnEtapaPedido").addClass('hidden'); // deixar de aparecer o conteudo da EtapaPedido
            $("#btnEtapaEndereco").addClass('hidden'); // deixar de aparecer o conteudo da EtapaEndereco
            $("#btnEtapaResumo").removeClass('hidden'); //  aparecer o conteudo da EtapaResumo
            $("#btnEtapaVoltar").removeClass('hidden'); // aparecer o conteudo da EtapaVoltar, ao clicar
        }
    },

    // botao de voltar etapa
    voltarEtapa: () => {


        let etapa = $(".etapa.active").length; // pega a etapa em que o usuário estiver.
        cardapio.metodos.carregarEtapa(etapa - 1); // chamando o metodo criado
    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1); // chamando o método carregarEtapa

        if (meuCarrinho.length > 0) { // length realiza a contagem

            $("#itensCarrinho").html(''); // ação de limpar lista dos itensCarrinhos para carregar novos itens

            $.each(meuCarrinho, (i, e) => { // percorrer os elementos do carrinho e exibir na tela

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img) // 'g', 'e.img' ou seja, substituir 'g' pelo nome 'e.img'
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id) //  criando uma variavel e passand um valor a elas
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp); // adicionar templates na lista de carrinhos

                // ultimo item
                if ((i + 1) == meuCarrinho.length) {
                    cardapio.metodos.carregarValores();
                }

            })
        } else {
            // adicionando mensagem de carrinho vazio
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio</p>'); 
            cardapio.metodos.carregarValores();
        }

    },

    // diminuir a quantidade do item no carrinho
    diminuirQuanitdadeCarrinho: (id) => { // método que pegando o id que para realizar a ação

        // criando e armazenando a quantidade total de cada item
        let quantidadeAtual = parseInt($("#qntd-carrinho-" + id).text()); 

        if (quantidadeAtual > 1) {
            $("#qntd-carrinho-" + id).text(quantidadeAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, quantidadeAtual - 1);
        } else {
            cardapio.metodos.removerItemCarrinho(id)
        }
        


    },

    // aumenta a quantidade do item no carrinho
    aumentarQuantidadeCarrinho: (id) => {
        let quantidadeAtual = parseInt($("#qntd-carrinho-" + id).text()); 
        $("#qntd-carrinho-" + id).text(quantidadeAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, quantidadeAtual + 1);
    },

    // botoao remover item do carrinho
    removerItemCarrinho: (id) => {

        // realiza um filtro no carrinho, retornando elementos diferentes do valor atual
        meuCarrinho = $.grep(meuCarrinho, (e, i) => {return e.id != id});
        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBadgeTotal();
    },

    // atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => { 

        let objetoIndex = meuCarrinho.findIndex((obj => obj.id == id)); // obter o index do item modificado
        meuCarrinho[objetoIndex].qntd = qntd // passando o valor na posição

        cardapio.metodos.atualizarBadgeTotal(); // atualiza o botao carrinho com a quantidade atualizada

        // atualizar os valores do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega os valores de Subtotal, Entrega e Total
    carregarValores: () => {

        valorCarrinho = 0;

        $("#lblSubTotal").text('R$ 0,00'); // substitui o texto
        $("#lblValorEntrega").text('+ R$ 0,00'); // substitui o texto
        $("#lblValorTotal").text('R$ 0,00'); // substitui o texto

        $.each(meuCarrinho, (i, e) => { // percorrrer o array carrinho
            
            valorCarrinho += parseFloat(e.price * e.qntd); // 'i' = index, 'e' = elemento, calculando o valor total

            if ((i + 1) == meuCarrinho.length) {
                $("#lblSubTotal").text(`R$ ${valorCarrinho.toFixed(2).replace('.', ',')}`);  // alterar os valores do subtotal
                $("#lblValorEntrega").text(`+ R$ ${valorEntrega.toFixed(2).replace('.', ',')}`); 
                $("#lblValorTotal").text(`R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}`); 
            }
        })
       
    },

    // carregar etapas endereço
    carregarEndereco: () => {

        if (meuCarrinho.length <= 0) { // se a contagem do meuCarrinho for menor ou igual a zero
            cardapio.metodos.mensagemGlobal('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapa(2); // abre a segunda etapa


    },

    // chamando API viaCEP
    buscarCep: () => {
 
        // 'val': é valor da variavel, 'trim': limpa espaços antes e depois do texto e 'replace': remove caracteres vazios
        var cep = $("#txtCep").val().trim().replace(/\D/g, ''); // criando variavel do valor do cep

        // verifica se o CEP possui valor informado
        if (cep != "") {

            var validarCep = /^[0-9]{8}$/; // expressao regular para valdiar cep

            if (validarCep.test(cep)) { // testa se foi validado o cep 

                // buscando informações válidas da API
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // atualziar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUF").val(dados.uf);
                        $("#txtNumero").focus();
                       

                    } else {
                        cardapio.metodos.mensagemGlobal('CEP não encontrado. Favor, insira um CEP válido');
                        $("#txtEndereco").focus();
                    }

                }); 

            } else {
                cardapio.metodos.mensagemGlobal('Formato do CEP, inválido.');
                $("#txtCEP").focus(); // foca no campo inválido
            }

        } else {
            cardapio.metodos.mensagemGlobal('Informe o CEP, por favor');
            $("#txtCEP").focus(); // foca no campo inválido
        }
    },

    // validação antes de prosseguir para etapa 3
    resumoPedido: () => {

        let observacao = $("#txtObs").val().trim();
        let nome = $("#txtNome").val().trim();
        let cep = $("#txtCep").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUF").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if (nome.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe seu Nome, por favor.');
            $("#txtNome").focus();
            return;
        }
        if (cep.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe seu CEP, por favor.')
            $("#txtCep").focus();
            return;
        }
        if (endereco.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe seu Endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }
        if (bairro.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe seu Bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }
        if (cidade.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe sua Cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }
        if (uf == "-1") {
            cardapio.metodos.mensagemGlobal('Informe a UF, por favor.');
            $("#ddlUF").focus();
            return;
        }
        if (numero.length <= 0) {
            cardapio.metodos.mensagemGlobal('Informe o Numero, por favor.');
            $("#txtNumero").focus();
            return;
        }

        meuEndereco = { // gerando os objetos
            observacao: observacao,
            nome: nome,
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    // carrega a etapa de Resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html(''); // html vai receber alguma algo

        $.each(meuCarrinho, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img) // 'g', 'e.img' ou seja, substituir 'g' pelo nome 'e.img'
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp); // adiciona o temp
        })

        // html vai receber alguma algo
        $("#resumoEndereco").html(`${meuEndereco.endereco}, ${meuEndereco.numero}, ${meuEndereco.bairro}`);
        $("#cidadeEndereco").html(`${meuEndereco.cidade}-${meuEndereco.uf} / ${meuEndereco.cep} ${meuEndereco.complemento}`);

       
       cardapio.metodos.finalizarPedido();
        
    },

    // atualiza o link do whatsapp
    finalizarPedido: () => {

        if (meuCarrinho.length > 0 && meuEndereco != null) {

            var numeroAleatorio = Math.floor(Math.random() * 10) + 1;
            var dataHoraAtual = new Date();
            var data = dataHoraAtual.toLocaleDateString();
            var hora = dataHoraAtual.getHours();
            var minuto = dataHoraAtual.getMinutes();

            var texto = `SEU PEDIDO: *FRANGO LOUCO*\nDetalhes do pedido:\n\n`;

            if (meuEndereco.observacao != null) {
                texto +=  `*OBSERVAÇÃO:* ${meuEndereco.observacao}\n---------------\n`;
            }
            else {
                texto +=  `*OBSERVAÇÃO:* sem observação\n---------------\n`;
            }

            texto += `Número do pedido: *${numeroAleatorio}*\n`;
            texto += `Realizado em: ${data} - ${hora}:${minuto}\n-------------------------\n`;
            texto += `Nome: *${meuEndereco.nome}*\n-------------------------\n*RESUMO DO PEDIDO*`;
            texto += `\n*\${itens}*\n---------------------\n`;

            if (meuEndereco.bairro == "Jardim Sulacap") {
                valorEntrega = 3;
                texto += `*VALOR A PAGAR:* R$ ${valorCarrinho}\n *Taxa de entrega:* R$ ${valorEntrega.toFixed(2).replace('.', ',')}`;
                texto += `\n*   Total (com entrega):* R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}`;
            } else if (meuEndereco.bairro == "Realengo" || meuEndereco.bairro == "Bento Ribeiro" || meuEndereco.bairro == "Marechal Hermes" || meuEndereco.bairro == "Deodoro") {
                valorEntrega = 8;
                texto += `*VALOR A PAGAR:* R$ ${valorCarrinho.toFixed(2).replace('.', ',')}\n *Taxa de entrega:* R$ ${valorEntrega.toFixed(2).replace('.', ',')}`;
                texto += `\n*   Total (com entrega):* R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}`;
            } else {
                texto += `*VALOR A PAGAR:* R$ ${valorCarrinho.toFixed(2).replace('.', ',')}\n *Taxa de entrega:* R$ ${valorEntrega.toFixed(2).replace('.', ',')}`;
                texto += `\n*   Total (com entrega):* R$ ${(valorCarrinho + valorEntrega).toFixed(2).replace('.', ',')}`;
            }

            texto += `\n--------------\n*ENDEREÇO DE ENTREGA:*`;
            texto += `\n${meuEndereco.endereco}, ${meuEndereco.numero}\n${meuEndereco.bairro}`;
            texto += `\nCEP: ${meuEndereco.cep}\n`;

            if (meuEndereco.complemento != null) {
                texto += `Complemento: ${meuEndereco.complemento}\n`;
            }

            texto += `Previsão de entrega: 50-60 min\n\n-------------\n`;
            texto += `Nome: *${meuEndereco.nome}*\nPIX: 21995291891\n *PAGAMENTO NO CARTÃO, AVISAR NO WHATSAPP*`;
            
            /* texto += `\n\n*Total (com entrega): R$ ${valorCarrinho.toFixed(2).replace('.', ',')}*`; */ // calculo sem entrega

            var itens = '';
            $.each(meuCarrinho, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} : *R$ ${e.price.toFixed(2).replace('.', ',')}*  \n`;

                if ((i + 1) == meuCarrinho.length) { // quando estiver na última parte

                    texto = texto.replace(/\${itens}/g, itens);

                    // converter URL
                    let encode = encodeURI(texto); // ajustando url 
                    let url = `https://wa.me/${celularEmpresa}?text=${encode}`; // colando a mensagem para ir pro whatsapp

                    $("#btnEtapaResumo").attr('href', url); // realizando a linkagem para o botão
                }
            })
        }
    },

    // carrega o link do botão reserva
    carregarBotaoReserva: () => {

        var texto = '⭐Olá! Gostaria de fazer uma *reserva*';

        // converter URL
        let encode = encodeURI(texto); // ajustando url 
        let url = `https://wa.me/${celularEmpresa}?text=${encode}`; // colando a mensagem para ir pro whatsapp

        $("#btnReserva").attr('href', url);
    },

    // carregar o botão ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${celularEmpresa}`);
    },

    // abre depoimento
    abrirDepoimentos: (depoimento) => {

        // removendo os depoimentos
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');
        $("#depoimento-4").addClass('hidden');

        // removendo o ativo
        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');
        $("#btnDepoimento-4").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        4("#btnDepoimento-" + depoimento).addClass('active');


    },

    // abrir o whatsapp ao clicar no botão
    carregarBotaoWhatsapp: () => {

        let url = `https://wa.me/${celularEmpresa}`;

        $("#imgWhats").attr('href', url);
        $("#btnWhats").attr('href', url);
        $("#btnWhats2").attr('href', url);
    },

    // mesagem
    mensagemGlobal: (texto, cor = 'red', tempo = 3500) => { // gerando mensagem geral

        // gerando um id aleatório com a data atual para temporizar a notificação
        let id = Math.floor(Date.now() * Math.random()).toString(); 


       let mensagem = `<div id="msg-${id}" class ="animated bounceInDown toast ${cor}">${texto}</div>`;

       $("#container-mensagens").append(mensagem);


       setTimeout(() => { // método, temporizador para remover a mensagem
            $("#msg-" + id).removeClass(('fadeInDown'));  
            $("#msg-" + id).addClass(('fadeOutUp'));  
           
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
       }, tempo) 
    }

}

cardapio.templates = { // inserindo classes e ids no HTML

    /* \${nomeBloco}, permite substituir as imagens de acordo com sua dientificação */
    item: `
         <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp delay-0.5">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}"/> 
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuanitdade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                </div>
            </div><!-- card card-item -->
        </div><!-- col-3 -->
    
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}">
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${name}</b></p>
                <p class="price-produto"><b>R$ \${price}</b></p>
            </div>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuanitdadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
                </div>
            </div><!-- col-12 item-carrinho -->    
    `,

    itemResumo: `
    <div class="col-12 item-carrinho resumo">
         <div class="img-produto-resumo">
            <img src="\${img}" alt="">
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${name}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${price}</b>
                </p>
                </div><!-- dados-produto -->
                    <p class="quantidade-produto-resumo">
                        x <b>\${qntd}</b>
                     </p>
    </div><!-- col-12 item-carrinho resumo -->
    `
}