const {Page} = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => await page.close());



describe('when user logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    it('can see blog form', async () => {
    
        const label = await page.getContentsOf('form label');
    
        expect(label).toEqual('Blog Title');
    });

    describe('and valid user input', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'First Test Title');
            await page.type('.content input', 'First Test Content');
            await page.click('form button');
        });
        
        it('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');
        });

        it('saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('First Test Title');
            expect(content).toEqual('First Test Content');
        });
    });

    describe('and invalid user input', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });
        
        it('form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('when user NOT logged in', async () => {
    // const actions = [
    //     {
    //         method: 'get',
    //         path: '/api/blogs'
    //     },
    //     {
    //         method: 'post',
    //         path: '/api/blogs',
    //         data: {
    //             title: 'T',
    //             content: 'C'
    //         }
    //     }
    // ];

    // test('blog actions forbidden', async () => {
    //     const results = await page.execRequests(actions);

    //     for (let result of results) {
    //         expect(result.error).toEqual('You must log in!');
    //     }
    // });

    it('user cannot create blog posts', async () => {
        
        const result = await page.post('/api/blogs', {title: 'Title', content: 'Content'});

        expect(result.error).toEqual('You must log in!');
    });

    it('user cannot see list o blog posts', async () => {
        const result = await page.get('/api/blogs');

        expect(result.error).toEqual('You must log in!');
    });
});