export default function AppLogo() {
    return (
        <>
            <div className="mr-2 flex items-center justify-center rounded-md bg-transparent">
                <img src="/assets/images/logo.svg" alt="Logo" className="h-6 w-6" />
            </div>
            <div className="grid flex-1 text-center text-sm">
                <span className="truncate leading-none font-semibold">LawanJudol.ID</span>
            </div>
        </>
    );
}
