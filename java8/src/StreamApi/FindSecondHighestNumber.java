package StreamApi;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public class FindSecondHighestNumber {
	private static Optional<Integer> first;

	public static void main(String[] args) {
		List<Integer> list = Arrays.asList(10, 20, 30, 40, 50);
		 Integer first = list.stream().distinct().sorted((a, b) -> b - a).skip(1).findFirst().orElse(null);
		System.out.println(first);
	}
}
