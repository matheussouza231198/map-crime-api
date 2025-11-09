# Crime App

## RFs (Requisitos funcionais)

- [ ] Deve ser possível fazer uma nova denuncia
- [ ] Deve ser possível visualizar uma denuncia especifica
- [ ] Deve ser possível listar as denuncias
- [ ] Deve ser possível atribuir uma a denuncia a um 'operador'
- [ ] Deve ser possível atualizar o status de um denuncia especifica
- [ ] Deve ser possível visualar um dashboard com algumas metricas sobre as denuncias.
- [ ] Deve ser possível visualar os locais com mais incidencias de crime.
- [ ] Deve ser possível gerencia os usuários CREATE/UPDATE/GET
- [ ] Deve ser possível gerar um relatorio das denuncias.

## RNs (Regras de negócio)
- [ ] Não deve ser necessário está autenticado para fazer um denuncia
- [ ] Quando for criado um denuncia deve ser retornado o código do protocolo.
- [ ] Para visualizar uma denuncia especifica deve ser informado o código do protocolo
- [ ] O status de uma denuncia pode ser: 'Pendente', 'Em andamento', 'Concluido', 'Arquivado'
- [ ] Apenas o operador atribuído a uma denuncia ou um administrador pode atualizar o status de uma denuncia.
- [ ] Apenas administradores podem gerenciar usuários.
- [ ] Apenas administradores podem atribuir denuncias a operadores.
- [ ] O relatorio de denuncias deve permitir filtros por data, status e operador.
- [ ] As metricas do dashboard devem incluir: total de denuncias, denuncias por status, denuncias por tipo de crime.
- [ ] No dashboard deve ser possível visualizar um gráfico de denuncias ao longo do tempo.
- [ ] No dashboard deve ser possivel visualizar um mapa heatmap com os locais de maior incidência de crimes.
- [ ] Deve ser enviado um email de confirmação ao criar uma nova denuncia.
- [ ] Deve ser enviado um email ao operador quando uma denuncia for atribuída a ele.

## RNFs (Requisitos não-funcionais)