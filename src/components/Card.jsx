const Card = ({ title, value, icon: Icon }) => {
  return (
    <div>
        <div className="card card-hover p-5 sm:p-6 relative overflow-hidden group flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-100">
        
        {/* left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-amber-700 group-hover:bg-indigo-500/70 transition-colors" />

        {/* text */}
        <div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>

        {/* icon */}
        {Icon && (
            <Icon className="size-10 p-2.5 rounded-lg bg-amber-700 text-white group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-200" />
        )}
        </div>
    </div>
    
  );
};

export default Card;