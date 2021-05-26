describe('Intro & Animations', () => {
    before(() => {           
    })

    beforeEach(() => {      
        cy.intercept('GET', Cypress.env('api_theme_url'), { fixture: 'events/animations.theme.json' })       
        cy.visit('/')
    })

    it('should show the initial video animation screen', () => {
        cy.get('#introVideo')
        .find('source')
        .should('have.attr', 'src', 'api/assets/01.mp4')
    })

    it('should show the website', () => {
        cy.get('#text')
        .find('p')
        .should('have.text', 'www.fotospiegelwelt.de')
    })

    it('click start and go through the animations', () => {      
        cy.log('initial intro animation should be clicklable')  
        cy.get('#introVideo').click()

        cy.log('clicking should transition to new animation')  
        cy.url({ timeout: 12000 }).should('include', '/anim1/6')
        .then(($option) => {
            cy.get('#animVideo', { timeout: 15000 })
                .find('source')
                .should('have.attr', 'src', 'api/assets/02.mp4')
        })

        cy.log('first animation should transition to second animation')  
        cy.url({ timeout: 12000 }).should('include', '/anim1/3')
        .then(($option) => {
            cy.get('#animVideo', { timeout: 15000 })
                .find('source')
                .should('have.attr', 'src', 'api/assets/03.mp4')
        })
    
    })
})