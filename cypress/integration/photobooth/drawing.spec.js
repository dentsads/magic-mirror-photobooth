describe('Calling the second page', () => {
    before(() => {        
    })

    beforeEach(() => {
        cy.intercept('GET', Cypress.env('api_theme_url'), { fixture: 'events/drawing.theme.json' })
        cy.intercept('POST', Cypress.env('api_composite_url'), (req) => {
            // set the request body to something different before it's sent to the destination
            req.body = 'username=janelane&password=secret123'
        })     
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

    /*

    it('', () =>{

        imgSrcList: context.capturedPhotoPaths,
        drawingImageDataURL: event.imageDataURL,


        {
            templateLayout: context.compositeConfig.templateLayout,
            imgSrcList: context.capturedPhotoPaths,
            drawingImageDataURL: event.imageDataURL,
            overlayImage: context.compositeConfig.overlayImage,
            logoImage: context.compositeConfig.logoImage,
            logoImageSize: context.compositeConfig.logoImageSize,
            logoImageOffset: context.compositeConfig.logoImageOffset,
            overlayText: context.compositeConfig.overlayText,
            overlayTextSize: context.compositeConfig.overlayTextSize,
            overlayTextOffset: context.compositeConfig.overlayTextOffset
        }

        "compositeConfig": {
            "templateLayout": "THREE_NON_UNIFORM",
            "overlayImage": "wedding_01_overlay_base_01.png",
            "logoImage": "fotospiegelwelt_logo2_scaled.png",
            "logoImageOffset": "+160+885",
            "logoImageSize": "80",
            "overlayText": "www.fotospiegelwelt.de",
            "overlayTextSize": "30",
            "overlayTextOffset": "+240+940"
        }


    })

    */
})