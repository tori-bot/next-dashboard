'use client';//this is a client component

import {useEffect} from 'react';

export default function Error({
    error,reset,//properties
}:{
        error:Error & {digest?: string};
        reset:()=>void;//try to re-render the route segment
}) {
    useEffect(()=>{
    console.error(error);
}, [error]);//effect runs whenever the error prop changes

return(
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
);
}