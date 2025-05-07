import { title } from "@/components/primitives"


const _404 = () => {
    return (
        <div>
            <h1 className={title()}>Oops...</h1>
            <p className="my-4">You've strayed off the path.</p>
        </div>
    )
}