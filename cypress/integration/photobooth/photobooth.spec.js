describe('Calling the page', () => {
    before(() => {
        cy.intercept('GET', '/api/theme', { fixture: 'photobooth.theme.json' })        
    })

    beforeEach(() => {        
        cy.visit('http://localhost:4200')
    })

    it('should show the initial "click here to start" screen', () => {
        cy.get('#introVideo')
        .find('source')
        .should('have.attr', 'src', 'api/assets/wedding_01_touchtostart_02.mp4')
    })
})

describe('Calling the second page', () => {
    before(() => {
        cy.intercept('GET', '/api/theme', { fixture: 'photobooth2.theme.json' })        
    })

    beforeEach(() => {        
        cy.visit('http://localhost:4200')
    })

    it('should show the initial "click here to start" screen', () => {
        cy.get('#introVideo')
        .find('source')
        .should('have.attr', 'src', 'api/assets/wedding_01_touchtostart_02.mp4')
    })
})