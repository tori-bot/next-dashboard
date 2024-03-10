'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams,usePathname,useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

//Search is a client component
export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams =useSearchParams();//access params from client
  const pathname=usePathname();
  const {replace}=useRouter();

  const handleSearch=useDebouncedCallback((term)=>{
    const params=new URLSearchParams(searchParams);
    params.set('page','1');//reset page no to 1 when user types new qiery

    //save queries and delete empty ones
    if (term){
      params.set('query',term);
    } else{
      params.delete('query');
    }
    //update the url with search data
    replace(`${pathname}?${params.toString()}`);
  }, 200);//add timer
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e)=>{
          handleSearch(e.target.value);
        }}
        //ensure input field is in sync with the url and will populate during sharing
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
