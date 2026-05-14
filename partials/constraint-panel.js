MODALS.constraint = `
<div class="constraint-bar" :class="{open: constraintOpen}">
  <div class="constraint-collapsed" @click="constraintOpen = true">
    <span class="constraint-rotated-label">Verificação de Restrições</span>
    <div class="constraint-mini-badges">
      <span class="mini-badge mini-ok"   x-text="constraints().filter(c=>!c.warn&&!disabledConstraints.includes(c.id)&&c.ok).length"></span>
      <span class="mini-badge mini-fail"
        x-show="constraints().filter(c=>!c.warn&&!disabledConstraints.includes(c.id)&&!c.ok).length > 0"
        x-text="constraints().filter(c=>!c.warn&&!disabledConstraints.includes(c.id)&&!c.ok).length"></span>
    </div>
  </div>
  <div class="constraint-expanded">
    <div class="constraint-bar-head" @click="constraintOpen = false">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-weight:800;font-size:14px">Verificação de Restrições</span>
        <span class="constraint-summary" x-html="constraintSummary()"></span>
      </div>
      <span style="font-size:12px;color:var(--muted)">✕</span>
    </div>
    <div class="constraint-rows">
      <template x-for="c in constraints()" :key="c.id">
        <div class="constraint-row"
          :class="{'constraint-disabled': disabledConstraints.includes(c.id), 'warn-row': c.warn && !disabledConstraints.includes(c.id)}">
          <div class="constraint-status"
            :class="disabledConstraints.includes(c.id) ? 'neutral' : (c.warn ? 'warn' : (c.ok ? 'ok' : 'fail'))"
            x-text="disabledConstraints.includes(c.id) ? '—' : (c.warn ? '⚠' : (c.ok ? '✓' : '✗'))"></div>
          <div>
            <div class="constraint-label" x-text="c.label"></div>
            <div class="constraint-value" x-text="c.value"></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px">
            <button class="pill-toggle" :class="disabledConstraints.includes(c.id) ? '' : 'on'"
              @click.stop="toggleConstraint(c.id)" title="Ativar/desativar restrição"></button>
            <button class="adv-toggle" @click="c.detailOpen = !c.detailOpen"
              x-text="c.detailOpen ? '▲' : 'ver lei'"></button>
          </div>
          <div class="constraint-detail" x-show="c.detailOpen" x-text="c.detail"></div>
        </div>
      </template>
    </div>
  </div>
</div>
`
