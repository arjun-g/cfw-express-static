import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export function site({
    path,
    onError
} = {}){
    return async (req, res) => {
        try{
            const options = {};
            if(path){
                options.mapRequestToAsset = request => new Request(`${req.url.origin}/${path}${req.url.pathname}`, request);
            }
            const page = await getAssetFromKV(req.event, options);
            const response = new Response(page.body, page);
            response.headers.set('X-XSS-Protection', '1; mode=block')
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('X-Frame-Options', 'DENY')
            response.headers.set('Referrer-Policy', 'unsafe-url')
            response.headers.set('Feature-Policy', 'none')
            res.send(response);
        }
        catch(ex){
            console.log("GOT ERROR", ex);
            if(onError){
                onError(req, res, ex);
            }
        }
    };
}

export function siteRenderer(){
    return (req, res) => {
        res.render = async (path) => {
            const page = await getAssetFromKV(req.event, {
                mapRequestToAsset: request => new Request(`${req.url.origin}/${path}`, request)
            });
            const response = new Response(page.body, page);
            response.headers.set('X-XSS-Protection', '1; mode=block')
            response.headers.set('X-Content-Type-Options', 'nosniff')
            response.headers.set('X-Frame-Options', 'DENY')
            response.headers.set('Referrer-Policy', 'unsafe-url')
            response.headers.set('Feature-Policy', 'none')
            res.send(response);
        }
    };
}
