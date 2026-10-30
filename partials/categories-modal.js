// Categories and period management dialog HTML
MODALS.cats = `
<dialog id="categories-modal" @click.self="closeCategoriesModal()">
  <div class="modal-head">
    <h3>Categorias e grupos</h3>
    <button class="modal-close" @click="closeCategoriesModal()">✕</button>
  </div>
  <div class="modal-body" x-show="_stagingCategories">
    <div class="field"><label>Grupos de carga horária</label></div>
    <template x-for="(g, idx) in _stagingGroups ?? []" :key="g.id">
      <div class="cat-row">
        <input type="text" class="cat-label-input" x-model="g.label" placeholder="Nome do grupo">
        <span x-show="g.locked" style="font-size:12px;color:var(--muted)">recebe as horas de extensão</span>
        <button class="cat-del-btn" @click="deleteStagingGroup(idx)"
          :disabled="g.locked || groupInUse(g.id)"
          :title="g.locked ? 'Grupo fixo' : (groupInUse(g.id) ? 'Em uso por disciplina, categoria ou restrição ativa' : 'Excluir')">✕</button>
      </div>
    </template>
    <button class="btn btn-cancel" style="width:100%" @click="addStagingGroup()">＋ Adicionar grupo</button>
    <div class="field" style="margin-top:8px"><label>Categorias / cores</label></div>
    <template x-for="(cat, idx) in _stagingCategories" :key="cat.id">
      <div class="cat-row">
        <div class="cat-colors">
          <template x-for="c in ['blue','sapphire','cyan','green','purple','pink','red','orange','salmon','yellow','gray']" :key="c">
            <button class="cat-color-btn" :class="c"
              :style="cat.value === c ? 'outline:2px solid #374151;outline-offset:2px' : ''"
              @click="cat.value = c" :title="c"></button>
          </template>
        </div>
        <template x-if="cat.locked">
          <span class="cat-label-input" style="display:flex;align-items:center;font-size:13px;color:var(--muted);font-style:italic" x-text="cat.label"></span>
        </template>
        <template x-if="!cat.locked">
          <input type="text" class="cat-label-input" x-model="cat.label" placeholder="Nome">
        </template>
        <template x-if="cat.locked">
          <span class="cat-nucleus-select" style="display:flex;align-items:center;font-size:13px;color:var(--muted)" x-text="groupLabel(cat.nucleus)"></span>
        </template>
        <template x-if="!cat.locked">
          <select class="cat-nucleus-select" @change="cat.nucleus = \$event.target.value">
            <template x-for="g in _stagingGroups ?? []" :key="g.id">
              <option :value="g.id" :selected="g.id === cat.nucleus" x-text="g.label"></option>
            </template>
          </select>
        </template>
        <button class="cat-del-btn" @click="deleteStagingCategory(idx)"
          :disabled="cat.locked || inUseCount(cat.value) > 0"
          :title="cat.locked ? 'Categoria fixa' : (inUseCount(cat.value) > 0 ? \`Em uso por \${inUseCount(cat.value)} disciplina(s)\` : 'Excluir')">✕</button>
      </div>
    </template>
    <button class="btn btn-cancel" style="width:100%;margin-top:12px" @click="addStagingCategory()">＋ Adicionar categoria</button>
  </div>
  <div class="modal-footer">
    <button class="btn btn-cancel" @click="closeCategoriesModal()">Cancelar</button>
    <button class="btn btn-primary" @click="saveCategoriesModal()">Salvar</button>
  </div>
</dialog>
`
