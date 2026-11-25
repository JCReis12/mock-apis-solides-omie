import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { monitoredSystems } from '../src/data/monitoring'

test('monitorar alvos sem atribuir estados reais e explorar o cenário demonstrativo', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/monitoramento')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Monitoramento do backoffice',
  )
  await expect(
    page.getByRole('status').filter({ hasText: 'Dados fictícios' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Dados da coleta', exact: true })
    .click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Sem coleta conectada' }),
  ).toBeVisible()
  await expect(page.locator('.system-monitor-card')).toHaveCount(
    monitoredSystems.length,
  )
  const solides = page.getByRole('article', { name: 'Sólides', exact: true })
  await expect(solides).toContainText('Sem telemetria')
  await expect(solides).toContainText('Não informado')
  await expect(solides.locator('td').first()).toHaveText('—')
  await page
    .getByRole('button', { name: 'Cenário demonstrativo', exact: true })
    .click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Dados fictícios' }),
  ).toBeVisible()
  await expect(solides).toContainText('Disponível')
  await expect(solides).toContainText('Colaboradores na base fictícia')
  await expect(solides).toContainText('120')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar dados JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('2rpnet-apps-demonstracao.json')
  const downloaded = JSON.parse(
    await readFile((await download.path())!, 'utf8'),
  )
  expect(downloaded.mode).toBe('demo')
  expect(downloaded.observations).toHaveLength(monitoredSystems.length)
  for (const system of monitoredSystems) {
    await expect(
      page.locator(`#monitor-${system.id}`).locator('..'),
    ).toContainText('Indicadores simulados')
  }
  await expect(
    page.getByRole('article', { name: 'SharePoint', exact: true }),
  ).toContainText('Indisponível')
  const vixting = page.getByRole('article', { name: 'Vixting', exact: true })
  await expect(vixting).toContainText('Disponível')
  await expect(vixting).toContainText('Pausada')
  const flash = page.getByRole('article', { name: 'Flash', exact: true })
  await flash.getByText('Origem e alvo observado').click()
  await expect(flash).toContainText('Falha de autorização')
  await expect(flash).toContainText('Sem telemetria')
  await expect(
    flash.getByRole('link', { name: 'Flash — manual de integração' }),
  ).toHaveAttribute('href', 'https://docs.api.flashapp.services/')
  const flow = page.locator('.monitor-workflow li')
  await expect(flow).toHaveCount(4)
  await expect(flow.nth(2)).toContainText('Falhou')
  await expect(flow.nth(3)).toContainText('Não executada')
  await page.getByLabel('Buscar sistema').fill('ómie')
  await expect(page.locator('.system-monitor-card')).toHaveCount(1)
  await expect(page.locator('.system-monitor-card')).toContainText('Omie')
  await page.getByLabel('Saúde observada').selectOption('available')
  await expect(
    page.getByRole('heading', { name: 'Nenhum alvo encontrado' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Restaurar inventário' }).click()
  await page.getByLabel('Estado da integração').selectOption('paused')
  await expect(page.locator('.system-monitor-card')).toHaveCount(1)
  await expect(page.locator('.system-monitor-card')).toContainText('Vixting')
  await page
    .getByRole('button', { name: 'Limpar filtros', exact: true })
    .click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-monitoring-demo.png`,
    fullPage: false,
  })
  await page.getByRole('switch', { name: 'Modo escuro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  if (testInfo.project.name === 'mobile') {
    for (const width of [320, 390, 480, 600, 601]) {
      await page.setViewportSize({ width, height: 844 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px`,
      ).toBe(true)
      expect(
        await page
          .locator(
            '.system-monitor-card, .monitor-filters, .monitor-workflow li, .app-sidebar',
          )
          .evaluateAll((elements) =>
            elements
              .filter((e) => e.scrollWidth > e.clientWidth + 1)
              .map((e) => e.className),
          ),
        `${width}px`,
      ).toEqual([])
    }
    await page.setViewportSize({ width: 390, height: 844 })
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-monitoring-dark.png`,
    fullPage: false,
  })
  await page
    .getByRole('button', { name: 'Dados da coleta', exact: true })
    .click()
  await expect(solides).toContainText('Sem telemetria')
  await expect(
    page.getByRole('button', {
      name: /Executar agente|Desligar|Ligar sistema/i,
    }),
  ).toHaveCount(0)
})

test('trocar cenários, manter a escolha na recarga e baixar os estados apresentados', async ({
  page,
}, testInfo) => {
  await page.goto('/monitoramento?mode=demo&scenario=normal')
  const selector = page.getByLabel('Cenário da demonstração')
  const rh = page.getByRole('article', { name: 'Sólides', exact: true })
  const finance = page.getByRole('article', { name: 'Omie', exact: true })
  const steps = page.locator('.monitor-workflow li')
  await expect(selector).toHaveValue('normal')
  await expect(finance).toContainText('Disponível')
  await expect(steps.nth(3)).toContainText('Concluída')
  await selector.selectOption('failure')
  await expect(finance).toContainText('Degradado')
  await expect(
    finance.getByRole('row', { name: /Taxa de erro/ }),
  ).toContainText('20%')
  await expect(steps.nth(2)).toContainText('Falhou')
  await expect(steps.nth(3)).toContainText('Não executada')
  await page.reload()
  await expect(selector).toHaveValue('failure')
  await expect(finance).toContainText('Degradado')
  await selector.selectOption('denied')
  await expect(rh).toContainText('Sem telemetria')
  await expect(page.locator('#monitor-demo-description')).toContainText(
    'HTTP 403',
  )
  await rh.getByText('Origem e alvo observado').click()
  await expect(rh).toContainText('Falha de autorização')
  await expect(steps.nth(1)).toContainText('Falhou')
  await expect(steps.nth(2)).toContainText('Não executada')
  await selector.selectOption('expired')
  await expect(
    page.locator('.system-monitor-card .monitor-badge--unknown'),
  ).toHaveCount(monitoredSystems.length)
  await expect(steps.nth(3)).toContainText('Sem informação')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar dados JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('2rpnet-apps-expired.json')
  const exported = JSON.parse(await readFile((await download.path())!, 'utf8'))
  expect(exported.demoScenario.id).toBe('expired')
  expect(
    exported.observations.every(
      (o: { health: string }) => o.health === 'unknown',
    ),
  ).toBe(true)
  expect(exported.execution.state).toBe('unknown')
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-scenario-expired.png`,
  })
  await page
    .getByRole('button', { name: 'Dados da coleta', exact: true })
    .click()
  await expect(selector).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Baixar dados JSON' }),
  ).toHaveCount(0)
  await expect(rh).toContainText('Não informado')
  await page
    .getByRole('button', { name: 'Cenário demonstrativo', exact: true })
    .click()
  await expect(selector).toHaveValue('expired')
  await selector.selectOption('overview')
  await expect(finance).toContainText('Degradado')
  if (testInfo.project.name === 'mobile') {
    for (const width of [320, 390, 601]) {
      await page.setViewportSize({ width, height: 844 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
  }
})
