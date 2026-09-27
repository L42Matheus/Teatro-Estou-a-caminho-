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
  avelino:           'Vitor',
  angelo:            'Victor',
  jesus:             'Gabriel',
  juju:              'Ana Carolina',
  salete:            'Greice',

  // --- Atores com mais de um personagem ---
  marluce:           'Valeska',
  marta:             'Raissa',
  maria:             'Hellen',

  nice:              'Mariana',

  izabel:            'Zozó',
  'dona-estalagem':  'Zozó',

  julio:             'Sandro',
  'doutor-da-lei':   'Sandro',

  sacerdote:         'Cadu',
  lazaro:            'Cadu',

  'ladrao-2':        'Edvan',
  'joao-discipulo':  'Edvan',

  samaritano:        'Netinho',
  tome:              'Ayrton',
  levita:            'Lucas',

  homem:             'Victor',
  pedro:             'Victor',

  'ladrao-1':        'Netinho',
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
