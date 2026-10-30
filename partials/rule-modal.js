// Rule builder dialog HTML: four choices and a value, read back as one Portuguese sentence
MODALS.rule = `
<dialog id="rule-modal" @click.self="closeRuleModal()">
  <div class="modal-head">
    <h3>Criar restrição</h3>
    <button class="modal-close" @click="closeRuleModal()">✕</button>
  </div>
  <template x-if="ruleDraft">
  <div class="modal-body">
    <div class="rule-grid">
      <div class="field">
        <label>Em cada</label>
        <select x-model="ruleDraft.scope" @change="normalizeRuleDraft()">
          <option value="course">curso (total)</option>
          <option value="period">período</option>
          <option value="discipline">disciplina</option>
        </select>
      </div>
      <div class="field">
        <label>Considerando</label>
        <select x-model="ruleDraft.filter.kind" @change="ruleDraft.filter.value = ''; normalizeRuleDraft()">
          <template x-for="(text, kind) in RULE_FILTERS" :key="kind">
            <option :value="kind" x-text="text"></option>
          </template>
        </select>
      </div>
      <div class="field" x-show="ruleDraft.filter.kind !== 'all'">
        <label x-text="ruleDraft.filter.kind === 'name' ? 'Trecho do nome' : 'Qual'"></label>
        <template x-if="ruleFilterOptions()">
          <select @change="ruleDraft.filter.value = \$event.target.value">
            <template x-for="o in ruleFilterOptions()" :key="o.id">
              <option :value="o.id" :selected="o.id === ruleDraft.filter.value" x-text="o.label"></option>
            </template>
          </select>
        </template>
        <template x-if="ruleDraft.filter.kind === 'name'">
          <input type="text" x-model="ruleDraft.filter.value" placeholder="ex.: Libras">
        </template>
      </div>
      <div class="field">
        <label>Medir</label>
        <select @change="ruleDraft.measure = \$event.target.value; normalizeRuleDraft()">
          <template x-for="m in ruleMeasures()" :key="m">
            <option :value="m" :selected="m === ruleDraft.measure" x-text="RULE_MEASURES[m]"></option>
          </template>
        </select>
      </div>
      <div class="field">
        <label>Regra</label>
        <select @change="ruleDraft.op = \$event.target.value; normalizeRuleDraft()">
          <template x-for="op in ruleOps()" :key="op">
            <option :value="op" :selected="op === ruleDraft.op" x-text="RULE_OPS[op]"></option>
          </template>
        </select>
      </div>
      <div class="field">
        <label>Valor</label>
        <div style="display:flex;gap:6px">
          <input type="number" min="0" x-model.number="ruleDraft.value">
          <select x-show="rulePercentAllowed()" x-model="ruleDraft.unit" style="width:auto">
            <option value="h">horas</option>
            <option value="%">% da CH total</option>
          </select>
        </div>
      </div>
    </div>
    <div class="rule-preview" x-text="ruleSentence()"></div>
    <div class="field">
      <label>Título (opcional)</label>
      <input type="text" x-model="ruleDraft.label" :placeholder="ruleSentence()">
    </div>
    <div class="field">
      <label>Lei / justificativa (aparece em "ver lei")</label>
      <textarea rows="3" x-model="ruleDraft.detail" placeholder="ex.: Resolução CEPE/UFRPE Nº 744/2024, Art. …"></textarea>
    </div>
  </div>
  </template>
  <div class="modal-footer">
    <button class="btn btn-cancel" @click="closeRuleModal()">Cancelar</button>
    <button class="btn btn-primary" @click="saveRule()" :disabled="ruleDraftInvalid()">Criar</button>
  </div>
</dialog>
`
