// =============================================================================
// Configuração do Elenco — Teatro EAC
// -----------------------------------------------------------------------------
// Mapeia cada personagem (chave em data.js) ao nome do ator/atriz.
// Para trocar alguém: basta editar aqui e recarregar a página. Não é preciso
// mexer em mais nenhum arquivo.
// =============================================================================

const ACTORS = {
  // --- Adolescentes (aparecem nas 3 peças) ---
  camila:            'Tainara',
  nina:              'Duda',
  lorena:            'Beatriz',
  paty:              'Morgana',
  britney:           'Milena',
  kelly:             'Mariana',
  joao:              'João',
  eugenio:           'Anderson',
  emanuel:           'Mateus',
  remela:            'Vinícius',

  // --- Coordenadores / familiares ---
  avelino:           'Douglas',
  angelo:            'Gabriel',
  jesus:             'Gabriel',
  juju:              'Ana Carolina',
  salete:            'Greice',

  // --- Atores com mais de um personagem ---
  marluce:           'Sandra',
  marta:             'Sandra',

  nice:              'Mariana',
  maria:             'Mariana',

  izabel:            'Zozó',
  'dona-estalagem':  'Zozó',

  julio:             'Ewerton',
  'doutor-da-lei':   'Ewerton',

  'ladrao-1':        'Vitor',
  lazaro:            'Vitor',

  'ladrao-2':        'Edvan',
  'joao-discipulo':  'Edvan',

  sacerdote:         'Jonas',
  tome:              'Jonas',

  homem:             'Gabriel',
  pedro:             'Gabriel',

  samaritano:        'Netinho',
  mensageiro:        'Netinho',

  // --- Júri do Bruno ---
  juiz:              'Gabriel',
  bruno:             'Neto',
  mirabel:           'Tainara',
  'acusacao-1':      'Adolescentes',
  'acusacao-2':      'Adolescentes',
  'defesa-1':        'Adolescentes',
  'defesa-2':        'Adolescentes',
};

// Retorna o nome do ator/atriz de um personagem (ou string vazia se não houver)
function actorFor(key) {
  return ACTORS[key] || '';
}
