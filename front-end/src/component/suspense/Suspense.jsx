import { Suspense } from "react";
const withSuspense = (Component) => {
    return function WrappedComponent(props){
        return (
        <Suspense fallback={<div>Loading...</div>}>
            <Component {...props} />
        </Suspense>
    )
    }
}
export default withSuspense;