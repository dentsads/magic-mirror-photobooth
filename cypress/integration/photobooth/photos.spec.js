describe('Photos & Compositions', () => {
    before(() => {        
    })

    beforeEach(() => {
        cy.fixCypressSpec('/cypress/integration/photo.spec.js')
        cy.intercept('GET', Cypress.env('api_theme_url'), { fixture: 'events/photos.theme.json' })
        cy.intercept('POST', Cypress.env('api_capture_url'), {
            result: { 
                imagePath: "pic1.jpg",
                exifOrientation: 1,
                eventId: "default"
            },
            level: "info",
            timestamp: "2021-05-24T14:45:40.792Z"
        })        
        cy.visit('/')
    })

    it('should show pic', () => {
        cy.get('#overlay-outer')
        .find('img')
        .should('have.attr', 'src', 'api/photos/default/pic1.jpg')

        cy.get('#photo-image')
        .should('be.visible')
        .and(($img) => {
            // "naturalWidth" and "naturalHeight" are set when the image loads
            expect($img[0].naturalWidth).to.be.greaterThan(0)
        })
        .toMatchImageSnapshot({
            imageConfig: {
                threshold: 0.001,
            },
            name: "testcase01", 
            separator: "_"
        })       
    })

})