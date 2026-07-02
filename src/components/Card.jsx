const Card = ({
  title,
  value,
  icon: Icon,
  color = "orange",
}) => {
  const colors = {
    orange: {
      bg: "bg-orange-100",
      icon: "from-orange-500 to-amber-700",
    },
    green: {
      bg: "bg-green-100",
      icon: "from-green-500 to-emerald-700",
    },
    blue: {
      bg: "bg-blue-100",
      icon: "from-blue-500 to-indigo-700",
    },
    red: {
      bg: "bg-red-100",
      icon: "from-red-500 to-rose-700",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "from-purple-500 to-violet-700",
    },
  };

  const theme = colors[color] || colors.orange;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative Background */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${theme.bg} opacity-40 blur-2xl transition-all duration-300 group-hover:scale-125`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </h2>
        </div>

        {Icon && (
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.icon} shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}
          >
            <Icon size={30} className="text-white" />
          </div>
        )}
      </div>

      <div
        className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${theme.icon} transition-all duration-300 group-hover:w-full`}
      />
    </div>
  );
};

export default Card;