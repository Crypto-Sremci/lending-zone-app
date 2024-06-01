const MenuButton = ({ title, setCurrPage, pageNumber, currNumber }) => {

    function headerCalled() {
        setCurrPage(pageNumber);
    }

    var menuColor = "opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-6 mb-4 cursor-pointer bg-gray-900";
    if (pageNumber === currNumber) {
        menuColor = "opacity-75 w-full shadow-lg rounded-lg px-8 pt-6 pb-6 mb-4 cursor-pointer bg-gray-700";
    }

    return (
    <div className="flex flex-col  xl:w-1/3
                        justify-center lg:items-start overflow-y-hidden pr-2" onClick={async () => await headerCalled()}>
        <div className={menuColor}>
            <h1 className="text-center text-white-300 font-bold">
                {title}
            </h1>
        </div>
    </div>
    );
};

export default MenuButton;
