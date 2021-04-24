describe('Calling the second page', () => {
    before(() => {
        cy.intercept('GET', Cypress.env('api_theme_url'), { fixture: 'themes/drawing.theme.json' })        
    })

    beforeEach(() => {        
        cy.visit('/')
    })

    it('should show the initial "click here to start" screen', () => {
        cy.get('.upper-canvas')
        .trigger('mousedown', { which: 1, clientX: 200, clientY: 100 })
        .trigger('mousemove', { which: 1, clientX: 700, clientY: 700 })
        .trigger('mousemove')
        .trigger('mouseup')

        cy.get('#button-color').click()
        cy.get('.pcr-swatches').first().click()

        cy.get('.upper-canvas')
        .trigger('mousedown', { which: 1, clientX: 700, clientY: 100 })
        .trigger('mousemove', { which: 1, clientX: 200, clientY: 700 })
        .trigger('mousemove')
        .trigger('mouseup')
    })
})