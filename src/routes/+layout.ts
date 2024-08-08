import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { createBrowserClient, isBrowser, parse } from "@supabase/ssr"
import type { LayoutLoad } from "./$types"

export const ssr = false;

export const load: LayoutLoad = async ({ fetch, data, depends }: any) => {
    depends('supabase:auth')

    const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
            fetch
        },
        cookies: {
            get(key) {
                if (!isBrowser()) {
                    return JSON.stringify(data.session)
                }
                const cookie = parse(document.cookie)
                return cookie[key]
            },
            set(key, value, options) {
                document.cookie = `${key}=${value}; path=/; max-age=${options.maxAge}`
            },
            remove(key, options) {
                document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            }
        }
    });

    const {
        data: { session } 
    } = await supabase.auth.getSession();

    return { supabase, session }
}