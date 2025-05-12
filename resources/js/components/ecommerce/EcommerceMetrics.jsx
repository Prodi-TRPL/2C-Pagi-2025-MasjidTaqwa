import {
    ArrowDownIcon,
    ArrowUpIcon,
    BoxIconLine,
    GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

function isValidSrc(src) {
    return typeof src === "string" && src.trim() !== "";
}

export default function EcommerceMetrics() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    {isValidSrc(GroupIcon) ? (
                        <img src={GroupIcon} alt="Group Icon" className="w-6 h-6 text-gray-800 dark:text-white/90" />
                    ) : null}
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Customers
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            3,782
                        </h4>
                    </div>
                    <Badge color="success">
                        {isValidSrc(ArrowUpIcon) ? (
                            <img src={ArrowUpIcon} alt="Arrow Up Icon" />
                        ) : null}
                        11.01%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    {isValidSrc(BoxIconLine) ? (
                        <img src={BoxIconLine} alt="Box Icon Line" className="w-6 h-6 text-gray-800 dark:text-white/90" />
                    ) : null}
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Orders
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            5,359
                        </h4>
                    </div>

                    <Badge color="error">
                        {isValidSrc(ArrowDownIcon) ? (
                            <img src={ArrowDownIcon} alt="Arrow Down Icon" />
                        ) : null}
                        9.05%
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
