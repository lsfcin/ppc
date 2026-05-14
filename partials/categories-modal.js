MODALS.cats = `
<dialog id="categories-modal" @click.self="closeCategoriesModal()">
  <div class="modal-head">
    <h3>Categorias / Cores</h3>
    <button class="modal-close" @click="closeCategoriesModal()">✕</button>
  </div>
  <div class="modal-body" x-show="_stagingCategories">
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
          <span class="cat-nucleus-select" style="display:flex;align-items:center;font-size:13px;color:var(--muted)" x-text="{ I: 'Núcleo I', II: 'Núcleo II', III: 'Núcleo III', IV: 'Núcleo IV' }[cat.nucleus]"></span>
        </template>
        <template x-if="!cat.locked">
          <select class="cat-nucleus-select" x-model="cat.nucleus">
            <option value="I">Núcleo I</option><option value="II">Núcleo II</option>
            <option value="III">Núcleo III</option><option value="IV">Núcleo IV</option>
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
