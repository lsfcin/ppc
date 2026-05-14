MODALS.edit = `
<dialog id="edit-modal" @click.self="closeModal()">
  <div class="modal-head">
    <h3>Editar disciplina</h3>
    <button class="modal-close" @click="closeModal()">✕</button>
  </div>
  <template x-if="editing">
  <div class="modal-body">
    <div class="modal-cols">
      <div class="modal-left">
        <div class="field">
          <label>Nome</label>
          <input type="text" x-model="editing.name" :disabled="editing && isOptativaColor(editing.color)">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field">
            <label>Departamento</label>
            <select x-model="editing.department">
              <option>DC</option><option>DED</option><option>DM</option>
              <option>DL</option><option>DLCH</option><option>Outro</option>
            </select>
          </div>
          <div class="field">
            <label>Período</label>
            <select x-model.number="editing.period">
              <template x-for="p in numPeriods" :key="p">
                <option :value="p" x-text="ordinals[p-1]"></option>
              </template>
            </select>
          </div>
        </div>
        <div class="checks-row">
          <label class="check-item" x-show="!editing.isElective"><input type="checkbox" x-model="editing.skipWeekly"> Excluir do limite semanal</label>
          <label class="check-item">EaD <input type="number" min="0" max="100" step="5" x-model.number="editing.eadPercent" style="width:52px;margin:0 4px;border:1px solid #d1d5db;border-radius:6px;padding:2px 6px;font-size:13px;text-align:center"> %</label>
        </div>
        <template x-if="editing.isElective">
          <div class="field">
            <label>CH Total (múltiplo de 15h)</label>
            <div style="display:flex;align-items:center;gap:10px">
              <input type="number" min="15" step="15" x-model.number="editing.teoria.hours" style="width:90px">
              <select class="nucleus-inline" style="width:auto"
                :value="editing.teoria.nucleus"
                @change="onElectiveNucleusChange(\$event.target.value)">
                <option value="I">Núcleo I</option><option value="II">Núcleo II</option>
                <option value="III">Núcleo III</option><option value="IV">Núcleo IV</option>
              </select>
            </div>
            <span class="hours-warning" x-show="hoursInvalid()" x-text="hoursWarning()" style="margin-top:4px;display:block"></span>
          </div>
        </template>
        <template x-if="!editing.isElective">
          <div class="field">
            <label>Carga horária (múltiplo de 15h)</label>
            <div class="hours-row">
              <div class="hours-cell">
                <label>Teoria</label>
                <input type="number" min="0" step="15" x-model.number="editing.teoria.hours" @change="fixColor()">
                <select x-show="editing.teoria.hours > 0" x-model="editing.teoria.nucleus" class="nucleus-inline" @change="fixColor()">
                  <option value="I">Núcleo I</option><option value="II">Núcleo II</option><option value="IV">Núcleo IV</option>
                </select>
              </div>
              <div class="hours-cell">
                <label>Prática</label>
                <input type="number" min="0" step="15" x-model.number="editing.pratica.hours" @change="fixColor()">
                <select x-show="editing.pratica.hours > 0" x-model="editing.pratica.nucleus" class="nucleus-inline" @change="fixColor()">
                  <option value="I">Núcleo I</option><option value="II">Núcleo II</option><option value="IV">Núcleo IV</option>
                </select>
              </div>
              <div class="hours-cell">
                <label>Extensão</label>
                <input type="number" min="0" step="15" x-model.number="editing.extensao.hours" @change="fixColor()">
                <div x-show="editing.extensao.hours > 0" class="nucleus-fixed">Núcleo III (fixo)</div>
              </div>
            </div>
            <div style="margin-top:6px;font-size:12px;color:var(--muted)">
              Total: <strong x-text="editing.teoria.hours + editing.pratica.hours + editing.extensao.hours + 'h'"></strong>
              <span class="hours-warning" x-show="hoursInvalid()" x-text="' — ' + hoursWarning()"></span>
            </div>
          </div>
        </template>
        <div class="field">
          <label>Categoria / Cor</label>
          <select @change="editing.color = \$event.target.value; onColorChange()">
            <template x-for="cat in availableCategories()" :key="cat.id">
              <option :value="cat.value" :selected="cat.value === editing.color" x-text="cat.label"></option>
            </template>
          </select>
        </div>
      </div>
      <div class="modal-right" :style="editing.isElective ? 'opacity:0.25;pointer-events:none' : ''">
        <div class="field">
          <label>Pré-requisitos</label>
          <div class="prereq-list">
            <template x-for="d in otherDisciplines()" :key="d.id">
              <label class="prereq-item">
                <input type="checkbox" :checked="editing.prerequisites.includes(d.id)" @change="togglePrereq(d.id)">
                <span x-text="\`\${ordinals[d.period-1]} — \${d.name}\`"></span>
              </label>
            </template>
          </div>
        </div>
        <div class="field">
          <label>Temas Transversais</label>
          <div class="prereq-list">
            <template x-for="theme in transversalThemes()" :key="theme.id">
              <label class="prereq-item">
                <input type="checkbox" :checked="(editing.tags ?? []).includes(theme.id)" @change="toggleTag(theme.id)">
                <span x-text="theme.label"></span>
              </label>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  <template x-if="editing">
  <div class="modal-footer">
    <button class="btn btn-danger"  @click="deleteEditing()">Excluir</button>
    <button class="btn btn-cancel"  @click="closeModal()">Cancelar</button>
    <button class="btn btn-primary" @click="saveEditing()" :disabled="hoursInvalid()">Salvar</button>
  </div>
  </template>
</dialog>
`
